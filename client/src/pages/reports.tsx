import { SidebarNavigation } from "@/components/sidebar-navigation";
import { ExpenseChart } from "@/components/expense-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Reports() {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View your spending analytics</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <ExpenseChart />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}