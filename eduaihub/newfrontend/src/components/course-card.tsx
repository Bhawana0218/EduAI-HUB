
import Link from 'next/link';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, CalendarDays, DollarSign } from 'lucide-react';

const normalizeCourse = (c: any) => {
  const data = c.data || c;
  const id = data._id || data.id || data.uniqueId;

  return {
    id,
    courseName: data.title || data.courseName || 'Untitled Course',
    universityName: data.university || data.universityName || 'Unknown University',
    overviewDescription: data.description || data.overviewDescription || '',

    courseLevel: data.level || data.courseLevel || 'N/A',
    durationMonths: data.duration_weeks || data.durationWeeks || data.duration || 'N/A',
    languageOfInstruction: data.language || data.languageOfInstruction || 'English',

    tuitionFeeCurrency: data.fees?.currency || data.tuitionFeeCurrency || 'USD',
    firstYearTuitionFee: data.fees?.min || data.firstYearTuitionFee || null,

    internationalApplicationDeadline: data.internationalApplicationDeadline || null,

    
    courseUrl: id ? `/courses/${id}` : (data.url || '#'),
  };
};

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course: rawCourse }: CourseCardProps) {
  const course = normalizeCourse(rawCourse);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline text-xl leading-tight">
          <Link href={course.courseUrl} className="hover:text-accent transition-colors">
            {course.courseName}
          </Link>
        </CardTitle>

        <CardDescription className="flex items-center gap-2 pt-1">
          <Building2 className="h-4 w-4" /> {course.universityName}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.overviewDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{course.courseLevel}</Badge>
          <Badge variant="secondary">{course.durationMonths} weeks</Badge>
          <Badge variant="secondary">{course.languageOfInstruction}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <span>
              <span className="font-semibold">
                {course.firstYearTuitionFee
                  ? `${course.firstYearTuitionFee.toLocaleString()} ${course.tuitionFeeCurrency}`
                  : 'N/A'}
              </span>{' '}
              / year
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span>
              Int'l Deadline:{' '}
              {course.internationalApplicationDeadline
                ? new Date(course.internationalApplicationDeadline).toLocaleDateString('en-US')
                : 'TBA'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-4">
        <Button asChild className="w-full" variant="outline">
          <Link href={course.courseUrl}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}