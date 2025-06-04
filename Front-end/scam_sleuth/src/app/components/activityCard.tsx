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
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    // Find the last space before maxLength to avoid cutting words
    const truncatedText = text.slice(0, maxLength);
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    return lastSpaceIndex > 0 
      ? truncatedText.slice(0, lastSpaceIndex) + '...'
      : truncatedText + '...';
  };

  const isLongDescription = activity.description.length > 60;

  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      {/* Left black label */}
      <div className="bg-black text-white sm:p-4 w-full sm:w-40 sm:max-w-[100px] flex items-center justify-center">
        <span className="text-sm font-medium text-center sm:[writing-mode:vertical-rl] sm:rotate-180 sm:max-h-[90px] whitespace-pre-wrap break-words">
          {activity.type}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-grow p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex-grow w-full sm:w-auto sm:pr-4">
          <h3 className="text-xl font-bold mb-2 text-gray-900">{activity.name}</h3>
          <p 
            className={`text-gray-600 leading-relaxed ${
              isLongDescription 
                ? 'text-xs line-clamp-2' 
                : 'text-sm'
            } max-w-prose`}
            title={activity.description} // Shows full description on hover
          >
            {truncateText(activity.description)}
          </p>
        </div>

        {/* Right side with date and button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
          <span className="text-gray-500 text-sm font-medium">{activity.date}</span>
          <Button 
            variant="outline"
            onClick={() => onReview(activity.id)}
            className="rounded-full px-6 font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200"
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