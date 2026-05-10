import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, ShoppingCart, DollarSign, Package, BarChart3 } from "lucide-react"
import { useTransactions } from "@/hooks/useTransactions"

export function SectionCards() {
  const { metrics } = useTransactions();

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Sales */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
            <DollarSign className="size-4" />
            Total Sales
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₱{metrics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              <TrendingUpIcon className="size-3 mr-1" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total money earned
          </div>
          <div className="text-muted-foreground">
            Sum of total_amount from transactions
          </div>
        </CardFooter>
      </Card>

      {/* Total Orders */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
            <ShoppingCart className="size-4" />
            Total Orders
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalOrders.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              <TrendingUpIcon className="size-3 mr-1" />
              Volume
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Volume of customers served
          </div>
          <div className="text-muted-foreground">
            Total number of rows in transactions
          </div>
        </CardFooter>
      </Card>

      {/* Average Order Value */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
            <BarChart3 className="size-4" />
            Average Order Value
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₱{metrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              <TrendingUpIcon className="size-3 mr-1" />
              Value
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Typical customer spend
          </div>
          <div className="text-muted-foreground">
            Total Sales divided by Total Orders
          </div>
        </CardFooter>
      </Card>

      {/* Items Sold */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
            <Package className="size-4" />
            Items Sold
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.itemsSold.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              <TrendingUpIcon className="size-3 mr-1" />
              Items
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Volume of products sold
          </div>
          <div className="text-muted-foreground">
            Sum of quantity in transaction_items
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
