import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardAnalytics = () => {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("accounts")
      .select("status, account_closing_balance");

    if (!data) return;

    const result = {
      total: data.length,
      active: 0,
      inactive: 0,
      freeze: 0,

      totalBal: 0,
      activeBal: 0,
      inactiveBal: 0,
      freezeBal: 0,
    };

    data.forEach((acc) => {
      const bal = acc.account_closing_balance || 0;

      result.totalBal += bal;

      if (acc.status === "active") {
        result.active++;
        result.activeBal += bal;
      } else if (acc.status === "inactive") {
        result.inactive++;
        result.inactiveBal += bal;
      } else if (acc.status === "freeze") {
        result.freeze++;
        result.freezeBal += bal;
      }
    });

    setStats(result);
  };

  const CardBox = ({ title, value }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Overview</h2>

      {/* Account Count Section */}
      <div className="grid md:grid-cols-4 gap-4">
        <CardBox title="Total Accounts" value={stats.total} />
        <CardBox title="Active Accounts" value={stats.active} />
        <CardBox title="Inactive Accounts" value={stats.inactive} />
        <CardBox title="Freeze Accounts" value={stats.freeze} />
      </div>

      {/* Balance Section */}
      <div className="grid md:grid-cols-4 gap-4">
        <CardBox title="Total Balance" value={`₹ ${stats.totalBal?.toLocaleString()}`} />
        <CardBox title="Active Balance" value={`₹ ${stats.activeBal?.toLocaleString()}`} />
        <CardBox title="Inactive Balance" value={`₹ ${stats.inactiveBal?.toLocaleString()}`} />
        <CardBox title="Freeze Balance" value={`₹ ${stats.freezeBal?.toLocaleString()}`} />
      </div>
    </div>
  );
};
