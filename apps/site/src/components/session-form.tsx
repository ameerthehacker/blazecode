import { Button } from './ui/button';

import { Controller, useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getUsername } from '@/storage';

export type FormData = {
  name: string;
};

export default function SessionForm({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (data: FormData) => void;
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: getUsername(),
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  autoFocus
                  placeholder="Dennis Ritchie"
                  className="h-14 text-center md:text-xl"
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <Button size="lg" type="submit" className="w-full">
            Start Collaborating
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}