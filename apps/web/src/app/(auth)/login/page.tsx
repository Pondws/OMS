"use client"

import {
  Input,
  Button
} from "components"
import Image from "next/image"

import image from '../../../../public/images/login-image.jpg'
import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"

import { toast } from 'sonner'
import { handleError } from "utils"
import { useAuth } from "hooks"

const defaultValues = {
  email: '',
  password: ''
}

const schema = z.object({
  email: z.string().nonempty('Email is required'),
  password: z.string().nonempty('Password is required'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const handleLogin = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string; }) => login(email, password),
    onSuccess: () => router.push('/dashboard'),
    onError: (error) => {
      toast.error(handleError(error, ''))
    }
  })

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 h-screen gap-4 p-4"
      onSubmit={handleSubmit((values) => handleLogin.mutate(values))}
    >
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col gap-4 max-w-md w-full">
          <h1 className="text-2xl font-bold">
            Login
          </h1>
          <Input
            {...register('email')}
            label="Email"
            placeholder="Email"
            helperText={errors.email ? errors.email.message : ''}
            error={!!errors.email}
          />
          <Input
            {...register('password')}
            label="Password"
            placeholder="Password"
            type="password"
            helperText={errors.password ? errors.password.message : ''}
            error={!!errors.password}
          />
          <Button type="submit">
            Login
          </Button>
        </div>
      </div>

      <div className="w-full h-full relative">
        <Image
          src={image}
          alt="management"
          fill
          objectFit="cover"
          className="rounded-2xl"
        />
      </div>
    </form>
  )
}