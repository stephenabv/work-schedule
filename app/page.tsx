import ScheduleApp from "@/components/ScheduleApp";
import { SCHEDULE } from "@/lib/schedule-data";

export default function Home() {
  return <ScheduleApp initialEntries={SCHEDULE} />;
}
