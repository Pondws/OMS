import { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction
} from "components"

interface CardBodyProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function CardBody(props: CardBodyProps) {
  const {
    title,
    description,
    action,
    children
  } = props
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <h4>
            {title}
          </h4>
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
        <CardAction>
          {action}
        </CardAction>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}