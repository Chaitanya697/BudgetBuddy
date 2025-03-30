import { SidebarNavigation } from "@/components/sidebar-navigation";
import { TransactionHistory } from "@/components/transaction-history";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Transactions() {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your transactions</p>
        </div>
        
        <Tabs defaultValue="list" className="mb-8">
          <TabsList>
            <TabsTrigger value="list">Transaction List</TabsTrigger>
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <TransactionHistory />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Transaction</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <AddTransactionForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}