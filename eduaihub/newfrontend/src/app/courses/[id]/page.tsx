
import { universities } from '@/lib/data/universities';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  BookUser,
  Building2,
  Calendar,
  CircleDollarSign,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  GanttChartSquare,
  School,
  Target,
  User,
} from 'lucide-react';
import Image from 'next/image';

interface DetailPageProps {
  params: {
    id: string;
  };
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function getCourse(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function normalizeCourse(raw: any) {
  // ✅ Fix: Robust response unwrapping
  const data = raw?.data || raw;

  const eligibility = data?.eligibility || {};
  const fees = data?.fees || {};

  return {
    courseName: data?.title || data?.courseName || data?.course_id || 'Untitled Course',
    courseLevel: data?.level || data?.courseLevel || 'N/A',
    universityName: data?.university || data?.universityName || 'Unknown University',
    overviewDescription: data?.description || data?.overviewDescription || 'Detailed information for this course is currently being updated.',
    durationWeeks: data?.duration_weeks || data?.durationWeeks || data?.duration || null,
    credits: data?.credits ?? null,
    languageOfInstruction: data?.language || data?.languageOfInstruction || 'N/A',
    departmentSchool: data?.department || data?.departmentSchool || 'N/A',
    disciplineMajor: data?.category || data?.disciplineMajor || 'N/A',
    instructor: data?.instructor || null,

    minimumIELTSScore: eligibility?.ielts ?? data?.minimumIELTSScore ?? null,
    undergraduateDegreeRequirement:
      eligibility?.degree ?? data?.undergraduateDegreeRequirement ?? 'N/A',

    tuitionFeeCurrency: fees?.currency || data?.tuitionFeeCurrency || 'USD',
    firstYearTuitionFee: fees?.min ?? data?.firstYearTuitionFee ?? null,

    applicationLink: data?.application_link || data?.applicationLink || null,
    syllabusUrl: data?.syllabus_url || data?.syllabusUrl || null,

    internationalApplicationDeadline:
      data?.internationalApplicationDeadline ||
      data?.application_deadline ||
      data?.deadline ||
      null,

    domesticApplicationDeadline: data?.domesticApplicationDeadline || null,
  };
}

const DetailItem = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-4">
    <div className="text-accent mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="text-muted-foreground">{value || 'N/A'}</p>
    </div>
  </div>
);

export default async function CourseDetailPage({ params }: DetailPageProps) {
  const rawCourse = await getCourse(params.id);

  if (!rawCourse) {
    notFound();
  }

  const course = normalizeCourse(rawCourse);

  const university = universities.find(
    (u) => u.universityName === course.universityName
  );

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Badge>{course.courseLevel}</Badge>
                <CardTitle className="text-4xl">{course.courseName}</CardTitle>
                <CardDescription>
                  <School className="inline mr-2" />
                  {course.universityName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <p>{course.overviewDescription}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <DetailItem icon={<GanttChartSquare />} label="Discipline" value={course.disciplineMajor} />
                  <DetailItem icon={<BookUser />} label="Department" value={course.departmentSchool} />
                  {course.instructor && <DetailItem icon={<User />} label="Instructor" value={course.instructor} />}
                  <DetailItem
                    icon={<Clock />}
                    label="Duration"
                    value={course.durationWeeks ? `${course.durationWeeks} weeks` : 'N/A'}
                  />
                  <DetailItem icon={<GraduationCap />} label="Credits" value={course.credits} />
                  <DetailItem icon={<Languages />} label="Language" value={course.languageOfInstruction} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <CircleDollarSign /> Fees & Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem
                  icon={<CircleDollarSign />}
                  label="Tuition"
                  value={
                    course.firstYearTuitionFee !== null
                      ? `${course.firstYearTuitionFee.toLocaleString()} ${course.tuitionFeeCurrency}`
                      : 'N/A'
                  }
                />

                <DetailItem
                  icon={<Calendar />}
                  label="Deadline"
                  value={
                    course.internationalApplicationDeadline
                      ? new Date(course.internationalApplicationDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not provided'
                  }
                />

                <Button asChild className="w-full">
                  <Link href={course.applicationLink || '#'} target="_blank">
                    Apply <Globe className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem
                  icon={<Target />}
                  label="IELTS"
                  value={course.minimumIELTSScore !== null ? `${course.minimumIELTSScore}` : 'N/A'}
                />
                <DetailItem
                  icon={<Target />}
                  label="Degree"
                  value={course.undergraduateDegreeRequirement}
                />
              </CardContent>
            </Card>

            {university && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Building2 /> About University
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {university.imageUrl && (
                    <Image
                      src={university.imageUrl}
                      alt={university.universityName}
                      width={400}
                      height={200}
                    />
                  )}
                  <p>{university.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
