import ExpoModulesCore

/**
 * iOS : pas encore de capture du clavier matériel (elle demande une
 * implémentation UIKeyCommand testée sur un Mac et un iPad). Le module
 * existe pour que l'interface JavaScript soit la même ; il n'émet rien.
 */
public final class ZentechKeyboardModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZentechKeyboard")
    Events("onShortcut")

    Function("setShortcuts") { (_: [String]) in
    }
  }
}
