import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterType } from '@/lib/types';
import { ListTodo, CheckCircle2, Circle } from 'lucide-react';

interface TaskFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    todas: number;
    pendientes: number;
    completadas: number;
  };
}

export function TaskFilters({ currentFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div role="region" aria-label="Filtros de tareas">
      <Tabs 
        value={currentFilter} 
        onValueChange={(value) => onFilterChange(value as FilterType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="todas" 
            className="touch-target flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label={`Ver todas las tareas, ${counts.todas} en total`}
          >
            <ListTodo className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Todas</span>
            <span 
              className="ml-1 text-xs bg-background/20 px-1.5 py-0.5 rounded-full"
              aria-hidden="true"
            >
              {counts.todas}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="pendientes"
            className="touch-target flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label={`Ver tareas pendientes, ${counts.pendientes} en total`}
          >
            <Circle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Pendientes</span>
            <span 
              className="ml-1 text-xs bg-background/20 px-1.5 py-0.5 rounded-full"
              aria-hidden="true"
            >
              {counts.pendientes}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="completadas"
            className="touch-target flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label={`Ver tareas completadas, ${counts.completadas} en total`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Completadas</span>
            <span 
              className="ml-1 text-xs bg-background/20 px-1.5 py-0.5 rounded-full"
              aria-hidden="true"
            >
              {counts.completadas}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
