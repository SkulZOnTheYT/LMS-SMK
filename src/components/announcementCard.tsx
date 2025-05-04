interface Announcement {
    title: string;
    content: string;
    author: string | null;
    date: string;
}

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
    // Format date
    const formatDate = (dateString: string): string => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    };
  
    return (
      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
        <h3 className="font-medium text-gray-900 mb-1">{announcement.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{announcement.author || "Admin"}</span>
          <span>{formatDate(announcement.date)}</span>
        </div>
      </div>
    );
  }
  