import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image as ImageIcon, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { documentCategoryLabel, documents, formatDate, type DocumentItem } from "@/lib/mockData";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — RenoV Pilot" }] }),
  component: DocumentsPage,
});

type Cat = DocumentItem["category"] | "all";

function DocumentsPage() {
  const [cat, setCat] = useState<Cat>("all");
  const filtered = useMemo(() => documents.filter((d) => cat === "all" || d.category === cat), [cat]);

  const cats: Cat[] = ["all", ...Object.keys(documentCategoryLabel) as DocumentItem["category"][]];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & photos"
        description="Plans, devis, factures, photos chantier et garanties — au même endroit."
        actions={
          <Button size="sm" disabled>
            <Upload className="mr-1 h-4 w-4" />
            Importer
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
          return (
            <Card key={d.id} className="border-border/60 shadow-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  isImage ? "bg-info/10 text-info" : "bg-primary/10 text-primary",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {documentCategoryLabel[d.category]} · {d.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.date)} · {d.uploadedBy}
                  </p>
                </div>
                <Button variant="ghost" size="icon" disabled>
                  <Download className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">Aucun document dans cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
