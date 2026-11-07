"use client";

import { useEffect, useState } from "react";
import { basename, buildTree, dirname, type ProjectSnapshot, type TreeNode } from "@/lib/ide/fs";
import { cn } from "../ui";
import { FileIcon } from "./file-icon";
import { Icon } from "./icons";

export interface ExplorerActions {
  open: (path: string) => void;
  createFile: (path: string) => boolean;
  createFolder: (path: string) => boolean;
  rename: (from: string, to: string) => boolean;
  move: (from: string, intoFolder: string) => boolean;
  copy: (path: string) => void;
  remove: (path: string) => void;
  importFiles: () => void;
  importFolder: () => void;
  exportZip: () => void;
}

type Editing = { kind: "nouveau-fichier" | "nouveau-dossier"; parent: string } | { kind: "renommer"; path: string } | null;

/** Demande de création venue d'ailleurs (menu Fichier, page d'accueil) : `id` change à chaque demande. */
export interface CreateRequest {
  kind: "nouveau-fichier" | "nouveau-dossier";
  id: number;
}

export function Explorer({ project, activePath, dirty, actions, title, createRequest, onCreateHandled }: { project: ProjectSnapshot; activePath: string | null; dirty: (path: string) => boolean; actions: ExplorerActions; title: string; createRequest?: CreateRequest | null; onCreateHandled?: () => void }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Editing>(null);
  const [value, setValue] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const tree = buildTree(project);
  useEffect(() => {
    if (!createRequest) return;
    // Demande venue du menu Fichier ou de la page d'accueil : ouvre le champ de saisie à la racine.
    setEditing({ kind: createRequest.kind, parent: "" });
    setValue("");
    onCreateHandled?.();
  }, [createRequest, onCreateHandled]);

  const startCreate = (kind: "nouveau-fichier" | "nouveau-dossier", parent: string) => {
    setMenu(null);
    setCollapsed((c) => {
      const n = new Set(c);
      n.delete(parent);
      return n;
    });
    setEditing({ kind, parent });
    setValue("");
  };
  const startRename = (path: string) => {
    setMenu(null);
    setEditing({ kind: "renommer", path });
    setValue(basename(path));
  };
  const commit = () => {
    if (!editing) return;
    const name = value.trim();
    if (!name) {
      setEditing(null);
      return;
    }
    let ok = false;
    if (editing.kind === "renommer") ok = actions.rename(editing.path, dirname(editing.path) ? `${dirname(editing.path)}/${name}` : name);
    else {
      const path = editing.parent ? `${editing.parent}/${name}` : name;
      ok = editing.kind === "nouveau-fichier" ? actions.createFile(path) : actions.createFolder(path);
    }
    if (ok) setEditing(null);
  };

  const input = (depth: number, icon: "fichier" | "dossier") => (
    <div className="flex items-center gap-1.5 py-0.5 pr-2" style={{ paddingLeft: 8 + depth * 12 }}>
      {icon === "dossier" ? <Icon name="chevron" className="h-3.5 w-3.5 shrink-0 text-gray-400" /> : <FileIcon path={value || "x.txt"} />}
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          // Entrée : la validation passe par la perte du focus (un seul enregistrement).
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValue("");
            setEditing(null);
          }
        }}
        aria-label={icon === "dossier" ? "Nom du dossier" : "Nom du fichier"}
        placeholder={icon === "dossier" ? "nom-du-dossier" : "fichier.ext"}
        className="w-full rounded-sm border border-[var(--ide-accent)] bg-[var(--ide-input)] px-1.5 py-0.5 font-mono text-xs text-[var(--ide-text)] outline-none"
      />
    </div>
  );

  const onDrop = (target: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const from = e.dataTransfer.getData("text/upl-chemin");
    setDropTarget(null);
    if (from && from !== target && dirname(from) !== target) actions.move(from, target);
  };

  const renderNode = (n: TreeNode, depth: number): React.ReactNode => {
    const isOpen = n.kind === "dossier" && !collapsed.has(n.path);
    const renaming = editing?.kind === "renommer" && editing.path === n.path;
    return (
      <li key={n.path} role="treeitem" aria-expanded={n.kind === "dossier" ? isOpen : undefined} aria-selected={activePath === n.path}>
        {renaming ? (
          input(depth, n.kind === "dossier" ? "dossier" : "fichier")
        ) : (
          <div
            className={cn(
              "group relative flex h-[22px] cursor-pointer items-center gap-1.5 pr-1 text-[13px] hover:bg-[var(--ide-hover)]",
              activePath === n.path && "bg-[var(--ide-selection)] outline outline-1 -outline-offset-1 outline-[var(--ide-accent)]",
              dropTarget === n.path && "outline outline-1 outline-[var(--ide-accent)]",
            )}
            style={{ paddingLeft: 8 + depth * 12 }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/upl-chemin", n.path);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={n.kind === "dossier" ? (e) => { e.preventDefault(); setDropTarget(n.path); } : undefined}
            onDragLeave={n.kind === "dossier" ? () => setDropTarget(null) : undefined}
            onDrop={n.kind === "dossier" ? onDrop(n.path) : undefined}
            onClick={() => {
              if (n.kind === "dossier")
                setCollapsed((c) => {
                  const s = new Set(c);
                  if (s.has(n.path)) s.delete(n.path);
                  else s.add(n.path);
                  return s;
                });
              else actions.open(n.path);
            }}
            data-chemin={n.path}
          >
            {n.kind === "dossier" ? (
              <Icon name="chevron" className={cn("h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-90")} />
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            {n.kind === "fichier" && <FileIcon path={n.path} />}
            <span className="min-w-0 flex-1 truncate">{n.name}</span>
            {n.kind === "fichier" && dirty(n.path) && <span className="shrink-0 text-[11px] font-semibold text-amber-300" title="Modifications non enregistrées" aria-label="non enregistré">M</span>}
            <button
              type="button"
              className="shrink-0 rounded p-0.5 text-gray-400 opacity-70 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)] md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
              aria-label={`Actions pour ${n.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setMenu(menu === n.path ? null : n.path);
              }}
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>
            {menu === n.path && (
              <div role="menu" className="absolute right-1 top-full z-30 w-48 overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-panel)] py-1 text-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
                {n.kind === "dossier" && (
                  <>
                    <MenuItem onClick={() => startCreate("nouveau-fichier", n.path)}>Nouveau fichier ici</MenuItem>
                    <MenuItem onClick={() => startCreate("nouveau-dossier", n.path)}>Nouveau dossier ici</MenuItem>
                  </>
                )}
                <MenuItem onClick={() => startRename(n.path)}>Renommer</MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenu(null);
                    const to = window.prompt(`Déplacer « ${n.path} » vers le dossier (vide = racine du projet) :`, dirname(n.path));
                    if (to !== null) actions.move(n.path, to.trim().replace(/^\/+|\/+$/g, ""));
                  }}
                >
                  Déplacer vers…
                </MenuItem>
                <MenuItem onClick={() => { setMenu(null); actions.copy(n.path); }}>Dupliquer</MenuItem>
                <MenuItem danger onClick={() => { setMenu(null); actions.remove(n.path); }}>Supprimer</MenuItem>
              </div>
            )}
          </div>
        )}
        {n.kind === "dossier" && isOpen && (
          <ul role="group">
            {editing && editing.kind !== "renommer" && editing.parent === n.path && input(depth + 1, editing.kind === "nouveau-dossier" ? "dossier" : "fichier")}
            {n.children.map((c) => renderNode(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col" onClick={() => setMenu(null)}>
      <div className="group/titre flex h-[22px] items-center gap-0.5 pl-1 pr-1">
        <Icon name="chevron" className="h-3.5 w-3.5 rotate-90 text-[var(--ide-text)]" />
        <span className="mr-auto truncate text-[11px] font-bold uppercase text-[var(--ide-text)]">{title}</span>
        <ToolButton icon="nouveauFichier" label="Nouveau fichier" onClick={() => startCreate("nouveau-fichier", "")} />
        <ToolButton icon="nouveauDossier" label="Nouveau dossier" onClick={() => startCreate("nouveau-dossier", "")} />
        <ToolButton icon="importer" label="Importer des fichiers ou un ZIP" onClick={actions.importFiles} />
        <ToolButton icon="exporter" label="Exporter le projet en ZIP" onClick={actions.exportZip} />
      </div>
      <ul
        role="tree"
        aria-label="Fichiers du projet"
        className={cn("min-h-0 flex-1 overflow-auto pb-6", dropTarget === "" && "bg-[var(--ide-accent)]/10")}
        onDragOver={(e) => { e.preventDefault(); setDropTarget(""); }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={onDrop("")}
      >
        {editing && editing.kind !== "renommer" && editing.parent === "" && input(0, editing.kind === "nouveau-dossier" ? "dossier" : "fichier")}
        {tree.map((n) => renderNode(n, 0))}
        {!tree.length && !editing && <li className="px-3 py-2 text-xs text-[var(--ide-muted)]">Projet vide : créez un fichier.</li>}
      </ul>
    </div>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={cn("block w-full px-3 py-1.5 text-left hover:bg-[var(--ide-hover)]", danger ? "text-red-400" : "text-[var(--ide-text)]")}>
      {children}
    </button>
  );
}

export function ToolButton({ icon, label, onClick, active, disabled }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn("rounded p-1 text-[var(--ide-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)] disabled:opacity-40", active && "bg-[var(--ide-hover)] text-[var(--ide-text)]")}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}
