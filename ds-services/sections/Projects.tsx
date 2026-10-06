import Image from "next/image";
import { ProjectGallery, type GalleryItem } from "@/components/projects/ProjectGallery";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { hasRealProjects, projects, type Project } from "@/data/projects";

const SIZES: Record<Project["layout"], string> = {
  wide: "(min-width: 1024px) 66vw, 100vw",
  offset: "(min-width: 1024px) 40vw, 100vw",
  full: "(min-width: 1024px) 1280px, 100vw",
};

/** Dimensions des compositions provisoires (viewBox des fichiers SVG). */
const ART_SIZE: Record<Project["art"], { width: number; height: number }> = {
  elevation: { width: 1600, height: 1000 },
  tableau: { width: 800, height: 1000 },
  coupe: { width: 2100, height: 900 },
};

function media(project: Project, sizes: string) {
  if (project.image && !project.isPlaceholder) {
    return (
      <Image
        src={project.image.src}
        width={project.image.width}
        height={project.image.height}
        alt={project.alt}
        sizes={sizes}
        className="proj-img"
      />
    );
  }
  // Composition graphique provisoire (fichier SVG statique) — jamais présentée comme un chantier.
  return (
    <Image
      src={`/realisations/placeholder-${project.art}.svg`}
      {...ART_SIZE[project.art]}
      alt=""
      unoptimized
      className="proj-img"
    />
  );
}

/** Réalisations — une galerie de magazine d'architecture plutôt qu'un portfolio d'artisan. */
export function Projects() {
  const items: GalleryItem[] = projects.map((p) => ({
    id: p.id,
    layout: p.layout,
    category: p.category,
    location: p.location,
    year: p.year,
    isPlaceholder: p.isPlaceholder,
    media: media(p, SIZES[p.layout]),
    mediaLarge: media(p, "100vw"),
  }));

  return (
    <section id="realisations" className="section projects" aria-labelledby="projects-title" data-scene>
      <Rail />
      <div className="container-x">
        <div className="projects-head">
          <Eyebrow node count={String(projects.length).padStart(2, "0")}>
            Réalisations
          </Eyebrow>
          <h2 id="projects-title" className="t-section projects-title" data-reveal="lines">
            <span className="ln">Avant que les murs</span> <span className="ln">se referment.</span>
          </h2>
          <p className="t-body projects-intro" data-reveal="fade">
            {hasRealProjects
              ? "Un travail électrique soigné se lit pendant le chantier — avant d’être recouvert."
              : "Un travail électrique soigné se lit pendant le chantier. Les photographies des réalisations DS SERVICES prendront place ici."}
          </p>
        </div>

        <ProjectGallery items={items} />
      </div>
    </section>
  );
}
