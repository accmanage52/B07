import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardAnalytics = () => {
  const [stats, setStats] = useState<any>(null);

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
      } else {
        result.freeze++;
        result.freezeBal += bal;
      }
    });

    setStats(result);
  };

  if (!stats) return null;

  const StatCard = ({ title, value, color }: any) => (
    <Card className="bg-gradient-to-br from-card to-card/60 border border-border/40 shadow-lg hover:scale-[1.02] transition">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold" style={{ color }}>
        {value}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold">Financial Overview</h2>

      {/* Account Section */}
      <div>
        <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wide">
          Account Summary
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Total Accounts" value={stats.total} color="#38bdf8" />
          <StatCard title="Active Accounts" value={stats.active} color="#22c55e" />
          <StatCard title="Inactive Accounts" value={stats.inactive} color="#facc15" />
          <StatCard title="Freeze Accounts" value={stats.freeze} color="#ef4444" />
        </div>
      </div>

      {/* Balance Section */}
      <div>
        <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wide">
          Balance Summary
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total Balance"
            value={`₹ ${stats.totalBal.toLocaleString()}`}
            color="#38bdf8"
          />
          <StatCard
            title="Active Balance"
            value={`₹ ${stats.activeBal.toLocaleString()}`}
            color="#22c55e"
          />
          <StatCard
            title="Inactive Balance"
            value={`₹ ${stats.inactiveBal.toLocaleString()}`}
            color="#facc15"
          />
          <StatCard
            title="Freeze Balance"
            value={`₹ ${stats.freezeBal.toLocaleString()}`}
            color="#ef4444"
          />
        </div>
      </div>
    </div>
  );
};
