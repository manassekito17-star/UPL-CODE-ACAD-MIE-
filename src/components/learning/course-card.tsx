import Link from "next/link";
import { LEVEL_LABELS } from "@/content/types";
import type { CourseSummary } from "@/lib/content/repository";
import { Badge, Card, ProgressBar } from "../ui";
import { LANGUAGE_COLORS, LANGUAGE_INITIALS, LEVEL_TONES } from "../ui/labels";

export function CourseCard({ course, progress }: { course: CourseSummary; progress?: number }) {
  return (
    <Link href={`/formations/${course.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md">
        <div className={`flex items-center justify-between bg-gradient-to-r ${LANGUAGE_COLORS[course.language]} px-5 py-4`}>
          <span className="font-mono text-2xl font-black text-white drop-shadow">{LANGUAGE_INITIALS[course.language]}</span>
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-semibold text-white">{course.code}</span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold text-nuit-900 group-hover:text-electrique-600">{course.title}</h3>
          <p className="mt-1 flex-1 text-sm text-gris-700">{course.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge tone={LEVEL_TONES[course.level]}>{LEVEL_LABELS[course.level]}</Badge>
            <Badge>{course.lessonCount} leçons</Badge>
            <Badge>{course.exerciseCount} exercices</Badge>
            <Badge>≈ {course.durationHours} h</Badge>
            {course.status !== "publie" && <Badge tone="orange">{course.status}</Badge>}
          </div>
          {progress !== undefined && (
            <div className="mt-4">
              <ProgressBar value={progress} label={`Progression ${course.title}`} />
              <p className="mt-1 text-xs text-gris-500">{Math.round(progress)} % terminé</p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
