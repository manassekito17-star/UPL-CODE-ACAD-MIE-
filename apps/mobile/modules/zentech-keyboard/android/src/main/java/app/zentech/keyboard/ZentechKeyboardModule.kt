package app.zentech.keyboard

import android.app.Activity
import android.view.KeyEvent
import android.view.Window
import android.widget.EditText
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Raccourcis du clavier matériel (clavier Bluetooth, USB, Chromebook).
 *
 * React Native ne transmet pas les touches au JavaScript : ce module
 * s'intercale dans le Window.Callback de l'activité, reconnaît les
 * combinaisons que le JavaScript a déclarées (setShortcuts) et les lui envoie
 * (événement « onShortcut »). Les autres touches suivent leur chemin
 * habituel ; une lettre seule n'est jamais interceptée pendant une saisie.
 */
class ZentechKeyboardModule : Module() {
  private val chords = mutableSetOf<String>()

  override fun definition() = ModuleDefinition {
    Name("ZentechKeyboard")
    Events("onShortcut")

    Function("setShortcuts") { list: List<String> ->
      synchronized(chords) {
        chords.clear()
        chords.addAll(list)
      }
      install()
    }

    OnActivityEntersForeground { install() }
  }

  private fun install() {
    val activity: Activity = appContext.currentActivity ?: return
    activity.runOnUiThread {
      val window = activity.window
      val current = window.callback
      if (current !is Interceptor) window.callback = Interceptor(current) { event -> handle(activity, event) }
    }
  }

  private fun handle(activity: Activity, event: KeyEvent): Boolean {
    if (event.action != KeyEvent.ACTION_DOWN || event.repeatCount > 0) return false
    val chord = chordOf(event) ?: return false
    val typing = activity.currentFocus is EditText
    val hasMod = chord.startsWith("mod+")
    // Pendant une saisie, seules les combinaisons avec Ctrl ou Cmd sont des raccourcis.
    if (typing && !hasMod) return false
    val known = synchronized(chords) { chords.contains(chord) }
    if (!known) return false
    sendEvent("onShortcut", mapOf("chord" to chord))
    return true
  }

  private fun keyName(event: KeyEvent): String? {
    val code = event.keyCode
    return when {
      code in KeyEvent.KEYCODE_A..KeyEvent.KEYCODE_Z -> ('a' + (code - KeyEvent.KEYCODE_A)).toString()
      code in KeyEvent.KEYCODE_0..KeyEvent.KEYCODE_9 -> ('0' + (code - KeyEvent.KEYCODE_0)).toString()
      code == KeyEvent.KEYCODE_DEL -> "backspace"
      code == KeyEvent.KEYCODE_FORWARD_DEL -> "delete"
      code == KeyEvent.KEYCODE_TAB -> "tab"
      code == KeyEvent.KEYCODE_ESCAPE -> "escape"
      code == KeyEvent.KEYCODE_EQUALS || code == KeyEvent.KEYCODE_PLUS || code == KeyEvent.KEYCODE_NUMPAD_ADD -> "="
      code == KeyEvent.KEYCODE_MINUS || code == KeyEvent.KEYCODE_NUMPAD_SUBTRACT -> "-"
      code == KeyEvent.KEYCODE_SLASH -> "/"
      code == KeyEvent.KEYCODE_SEMICOLON -> ";"
      code == KeyEvent.KEYCODE_APOSTROPHE -> "'"
      else -> null
    }
  }

  private fun chordOf(event: KeyEvent): String? {
    val key = keyName(event) ?: return null
    val parts = mutableListOf<String>()
    if (event.isCtrlPressed || event.isMetaPressed) parts.add("mod")
    if (event.isAltPressed) parts.add("alt")
    if (event.isShiftPressed && key != "=") parts.add("shift")
    parts.add(key)
    return parts.joinToString("+")
  }

  /** Délègue tout à la fenêtre, sauf les combinaisons reconnues. */
  private class Interceptor(
    private val delegate: Window.Callback,
    private val onKey: (KeyEvent) -> Boolean,
  ) : Window.Callback by delegate {
    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
      if (onKey(event)) return true
      return delegate.dispatchKeyEvent(event)
    }
  }
}
