import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Priority, TaskFormData } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  priority: z.enum(['alta', 'media', 'baja'], {
    required_error: 'Selecciona una prioridad',
  }),
  dueDate: z.date().optional(),
});

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading = false }: TaskFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'media',
      dueDate: undefined,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({
      title: values.title,
      description: values.description || '',
      priority: values.priority as Priority,
      dueDate: values.dueDate,
    });
    form.reset();
  };

  return (
    <Card className="task-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
          Nueva Tarea
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-5"
            aria-label="Formulario para crear nueva tarea"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="task-title">
                    Título <span className="text-destructive" aria-hidden="true">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="task-title"
                      placeholder="¿Qué necesitas hacer?"
                      className="touch-target"
                      aria-required="true"
                      aria-describedby="title-error"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="title-error" role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="task-description">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      id="task-description"
                      placeholder="Añade más detalles sobre la tarea..."
                      className="min-h-[80px] resize-none"
                      aria-describedby="description-error"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="description-error" role="alert" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="task-priority">Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          id="task-priority" 
                          className="touch-target"
                          aria-label="Seleccionar prioridad de la tarea"
                        >
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="alta">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                            Alta
                          </span>
                        </SelectItem>
                        <SelectItem value="media">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                            Media
                          </span>
                        </SelectItem>
                        <SelectItem value="baja">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                            Baja
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha límite</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'touch-target justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            aria-label={field.value 
                              ? `Fecha seleccionada: ${format(field.value, "PPP", { locale: es })}` 
                              : "Seleccionar fecha límite"
                            }
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full touch-target font-medium"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Agregar Tarea</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
