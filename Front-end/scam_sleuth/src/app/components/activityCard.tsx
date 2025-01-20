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
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-background rounded-2xl overflow-hidden shadow-md">
      {/* Left black label */}
      <div className="bg-black text-white sm:p-4 w-full sm:w-40 sm:max-w-[100px] flex items-center justify-center">
        <span className="text-sm font-medium text-center sm:[writing-mode:vertical-rl] sm:rotate-180 sm:max-h-[90px] whitespace-pre-wrap break-words">
          {activity.type}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-grow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex-grow w-full sm:w-auto sm:pr-4">
          <h3 className="text-xl font-bold mb-2">{activity.name}</h3>
          <p className="text-gray-600 text-sm">{truncateText(activity.description)}</p>
        </div>

        {/* Right side with date and button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
          <span className="text-gray-500 text-sm">{activity.date}</span>
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
    <div className="space-y-4 mx-4 sm:mx-0">
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