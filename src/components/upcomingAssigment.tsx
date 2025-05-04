import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string | null; 
  isSubmitted: boolean;
}

export default function UpcomingAssignment({ assignment }: { assignment: Assignment }) {
  // Calculate days remaining
  const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return 0; // Handle invalid date
    }
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Handle null dueDate
  if (!assignment.dueDate) {
    return (
      <Link href={`/assignments/${assignment.id}`} className="block">
        <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors duration-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900">{assignment.title}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
              Tidak ada deadline
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{assignment.course}</p>
          <p className="text-xs text-gray-500">Deadline: Tidak ditentukan</p>
        </div>
      </Link>
    );
  }

  const daysRemaining = getDaysRemaining(assignment.dueDate);
  const formattedDate = formatDate(assignment.dueDate);

  // Determine status color
  let statusColor = "bg-yellow-100 text-yellow-800";
  let statusText = `${daysRemaining} hari lagi`;
  if (daysRemaining < 0) {
    statusColor = "bg-red-100 text-red-800";
    statusText = "Terlambat";
  } else if (daysRemaining <= 1) {
    statusColor = "bg-red-100 text-red-800";
  } else if (assignment.isSubmitted) {
    statusColor = "bg-green-100 text-green-800";
    statusText = "Dikumpulkan";
  }

  return (
    <Link href={`/assignments/${assignment.id}`} className="block">
      <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{assignment.course}</p>
        <p className="text-xs text-gray-500">Deadline: {formattedDate}</p>
      </div>
    </Link>
  );
}