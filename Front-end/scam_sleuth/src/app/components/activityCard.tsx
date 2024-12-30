// ActivityCard.tsx
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
}

interface ActivityCardProps {
  activity: ActivityItem;
  onReview: (id: string) => void;
}

export const ActivityCard = ({ activity, onReview }: ActivityCardProps) => {
  return (
    <div className="flex items-stretch bg-background rounded-2xl overflow-hidden shadow-md">
      {/* Left black label */}
      <div className="bg-black text-white p-4 w-32 flex items-center justify-center">
        <span className="text-sm font-medium rotate-180 text-center" style={{ writingMode: 'vertical-rl' }}>
          {activity.type}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-grow p-4 flex justify-between items-center">
        <div className="flex-grow pr-4">
          <h3 className="text-xl font-bold mb-2">{activity.name}</h3>
          <p className="text-gray-600 text-sm">{activity.description}</p>
        </div>

        {/* Right side with date and button */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-gray-500">{activity.date}</span>
          <Button 
            variant="outline"
            onClick={() => onReview(activity.id)}
            className="rounded-full px-6 font-bold"
          >
            Review
          </Button>
        </div>
      </div>
    </div>
  );
};

// ActivityList.tsx
interface ActivityListProps {
  activities: ActivityItem[];
  onReview: (id: string) => void;
}

export const ActivityList = ({ activities, onReview }: ActivityListProps) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard 
          key={activity.id} 
          activity={activity} 
          onReview={onReview}
        />
      ))}
    </div>
  );
};