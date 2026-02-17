import { ProjectData } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/mockData";
import { FileText, Calendar, Building2, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectCardProps {
  project: ProjectData;
  onClick?: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card 
      className="card-hover cursor-pointer border-border/50 bg-card"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary/70" />
            <span className="truncate">{project.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins className="h-4 w-4 text-primary/70" />
            <span>{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary/70" />
            <span>{formatDate(new Date(project.created_at))}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 text-primary/70" />
            <span>{project.requester_name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
