import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Image as ImageIcon, ExternalLink, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentCategoryLabel } from "@/lib/mock/labels";
import { formatDate } from "@/lib/utils/format";
import { getProjectById } from "@/lib/services/projects";
import {
  getDocumentsByProjectOnly,
  getSignedUrl,
  deleteDocument,
  type DocumentRow,
} from "@/lib/services/documents";
import { getLotsByProject } from "@/lib/services/lots";
import { FormAddDocument } from "@/components/forms/FormAddDocument";
import type { DocumentItem } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projets/$id/documents")({
  head: () => ({ meta: [{ title: "Documents — RenoV Pilot" }] }),
  component: DocumentsPage,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

type Cat = DocumentItem["category"] | "all";

const ALL_CATS: DocumentItem["category"][] = Object.keys(
  documentCategoryLabel,
) as DocumentItem["category"][];

function DocumentsPage() {
  const { id } = Route.useParams();
  const [documents, setDocuments] = useState<DocumentRow[] | null | "not-found">(null);
  const [cat, setCat] = useState<Cat>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
  const [lots, setLots] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) {
        setDocuments("not-found");
        return;
      }
      const [docs, projectLots] = await Promise.all([
        getDocumentsByProjectOnly(project.id),
        getLotsByProject(project.id),
      ]);
      if (!cancelled) {
        setDocuments(docs);
        setLots(projectLots.map((l) => ({ id: l.id, name: l.name })));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cats: Cat[] = ["all", ...ALL_CATS];
  const filtered = useMemo(
    () =>
      !documents || documents === "not-found"
        ? []
        : documents.filter((d) => cat === "all" || d.category === cat),
    [documents, cat],
  );

  const handleOpen = async (doc: DocumentRow) => {
    try {
      const url = await getSignedUrl(doc.storageBucket, doc.storagePath);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Impossible d'ouvrir le document.");
    }
  };

  const handleDelete = async (doc: DocumentRow) => {
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc);
      setDocuments((prev) =>
        Array.isArray(prev) ? prev.filter((d) => d.id !== doc.id) : prev,
      );
      toast.success("Document supprimé.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  if (documents === "not-found")
    return (
      <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>
    );
  if (documents === null) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & photos"
        description="Plans, devis, factures, photos chantier et garanties — au même endroit."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Upload className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        }
      />

      <Tabs value={cat} onValueChange={(v) => setCat(v as Cat)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
          {cats.map((c) => (
            <TabsTrigger key={c} value={c} className="text-xs">
              {c === "all" ? "Tous" : documentCategoryLabel[c as DocumentItem["category"]]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => {
          const isImage = d.category === "photos";
          const Icon = isImage ? ImageIcon : FileText;
          const isDeleting = deletingId === d.id;
          return (
            <Card key={d.id} className="border-border/60 shadow-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                    isImage ? "bg-info/10 text-info" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={d.name}>
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {documentCategoryLabel[d.category]} · {d.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.date)} · {d.uploadedBy}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpen(d)}
                    title="Ouvrir"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPendingDelete(d)}
                    disabled={isDeleting}
                    title="Supprimer"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            {documents.length === 0
              ? "Aucun document pour ce projet."
              : "Aucun document dans cette catégorie."}
          </p>
        )}
      </div>

      <FormAddDocument
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={id}
        lots={lots}
        onCreated={(doc) =>
          setDocuments((prev) => (Array.isArray(prev) ? [doc, ...prev] : [doc]))
        }
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => {
          if (!v) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le fichier et ses métadonnées seront définitivement
              supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) handleDelete(pendingDelete);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
