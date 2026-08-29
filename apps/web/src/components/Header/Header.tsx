import { ReactNode, Fragment } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "components"

interface HeaderProps {
  routes?: RoutesProps[]
  title: string
  actionButton: ReactNode
  filterBox?: ReactNode
}

interface RoutesProps {
  name: string
  path: string
}

export function Header(props: HeaderProps) {
  const {
    routes,
    title,
    actionButton,
    filterBox
  } = props
  return (
    <header id='header-box' className="flex flex-col gap-3 mb-4">
      <div className="flex items-center justify-between">
        <div>
          {routes &&
            <Breadcrumb>
              <BreadcrumbList>
                {routes.map((route, index) => {
                  const isLast = index === routes.length - 1
                  return (
                    <Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{route.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink render={<Link href={route.path} />}>
                            {route.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          }
          <h1>
            {title}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {actionButton}
        </div>
      </div>
      {filterBox && (
        <div>
          {filterBox}
        </div>
      )}
    </header>
  )
}