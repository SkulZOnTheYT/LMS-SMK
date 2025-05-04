import Link from 'next/link';
import { BookOpenIcon } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  instructor: string;
  image?: string;
  progress: number;
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="h-32 bg-gray-300 relative">
          {course.image ? (
            <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">
              {/* In a real app, you would use Image component from next/image */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              <span className="sr-only">{course.title}</span>
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <BookOpenIcon className="h-12 w-12 text-white" />
            </div>
          )}
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate">{course.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">{course.progress}% selesai</span>
          </div>
        </div>
      </div>
    </Link>
  );
}