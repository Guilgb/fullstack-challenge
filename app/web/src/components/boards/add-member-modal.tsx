import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddMember } from "@/hooks/use-boards";
import { BoardRole } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  role: z.nativeEnum(BoardRole).optional(),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
}

const roleOptions = [
  { value: BoardRole.MEMBER, label: "Membro" },
  { value: BoardRole.ADMIN, label: "Admin" },
];

export function AddMemberModal({
  open,
  onOpenChange,
  boardId,
}: AddMemberModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: "",
      role: BoardRole.MEMBER,
    },
  });

  const addMemberMutation = useAddMember();

  const onSubmit = (data: AddMemberFormData) => {
    addMemberMutation.mutate(
      {
        boardId,
        data: {
          userId: data.userId,
          role: data.role,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ID do Usuário *</Label>
            <Input
              id="userId"
              placeholder="Digite o ID do usuário"
              {...register("userId")}
              className={errors.userId ? "border-destructive" : ""}
            />
            {errors.userId && (
              <p className="text-sm text-destructive">
                {errors.userId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addMemberMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addMemberMutation.isPending}>
              {addMemberMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
