'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from '@/lib/app-state';
import { Download, Loader2, RefreshCcw, Search, ShieldCheck, Upload } from 'lucide-react';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const ME_ENDPOINT = API_BASE_URL.endsWith('/api')
  ? `${API_BASE_URL}/auth/me`
  : `${API_BASE_URL}/api/auth/me`;
const COURSE_UPLOAD_ENDPOINT = API_BASE_URL.endsWith('/api')
  ? `${API_BASE_URL}/admin/courses/upload`
  : `${API_BASE_URL}/api/admin/courses/upload`;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isHydrated,
    isAuthenticated,
    token,
    courses,
    totalCourses,
    isCoursesLoading,
    coursesError,
    courseQuery,
    setCourseQuery,
    fetchCourses,
    logout,
  } = useAppState();

  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const shouldDisableActions = !isAuthenticated || !token || isAuthorizing;

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !token) {
      router.replace('/admin/login');
      return;
    }

    const verifyAuth = async () => {
      setIsAuthorizing(true);
      try {
        const response = await fetch(ME_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Session expired. Please login again.');
        }

        await fetchCourses({ force: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Session validation failed.';
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: message,
        });
        logout();
        router.replace('/admin/login');
      } finally {
        setIsAuthorizing(false);
      }
    };

    verifyAuth();
  }, [isHydrated, isAuthenticated, token, logout, router, toast]);

  useEffect(() => {
    if (shouldDisableActions) return;

    const timer = setTimeout(() => {
      fetchCourses();
    }, 350);

    return () => clearTimeout(timer);
  }, [courseQuery, fetchCourses, shouldDisableActions]);

  const handleUpload = async () => {
    if (!selectedFile || shouldDisableActions) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsUploading(true);

    try {
      const response = await fetch(COURSE_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Upload failed.');
      }

      toast({
        title: 'Upload Successful',
        description: `Processed ${payload.received || 0} rows (${payload.inserted || 0} inserted, ${payload.updated || 0} updated).`,
      });
      setSelectedFile(null);
      await fetchCourses({ force: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Course upload failed';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Unique ID',
      'Course Name',
      'Course Code',
      'University Name',
      'Department/School',
      'Discipline/Major',
      'Specialization',
      'Course Level',
      'Overview/Description',
      'Credits',
      'Duration (Months)',
      'Language of Instruction',
      'Keywords (comma-separated)',
      'Professor Name',
      '1st Year Tuition Fee',
      'Total Tuition Fee',
      'Tuition Fee Currency',
      'Undergraduate Degree Requirement',
      'Minimum IELTS Score',
      'Minimum TOEFL Score',
      'Course URL',
    ];

    const csvHeader = `${headers.map((header) => `"${header}"`).join(',')}\n`;
    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'course_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const statusBadge = useMemo(() => {
    if (isAuthorizing) {
      return <Badge variant="secondary">Validating Session...</Badge>;
    }

    return <Badge className="bg-emerald-600 text-white">Authenticated</Badge>;
  }, [isAuthorizing]);

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Upload course data and manage searchable course listings.</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          {statusBadge}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Course CSV Upload</CardTitle>
              <CardDescription>Upload the assessment CSV and sync records to MongoDB.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            disabled={shouldDisableActions || isUploading}
          />
          {selectedFile ? (
            <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No CSV selected yet.</p>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || shouldDisableActions || isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Courses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Course Listings</CardTitle>
              <CardDescription>
                Showing {courses.length} of {totalCourses} courses
              </CardDescription>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={courseQuery}
                  onChange={(event) => setCourseQuery(event.target.value)}
                  placeholder="Search by title, category, university..."
                  className="pl-9"
                  disabled={shouldDisableActions}
                />
              </div>
              <Button variant="outline" onClick={() => fetchCourses({ force: true })} disabled={shouldDisableActions || isCoursesLoading}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {coursesError && <p className="text-sm text-destructive">{coursesError}</p>}

          {isCoursesLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading courses...
            </div>
          ) : null}

          {!isCoursesLoading && courses.length === 0 ? (
            <p className="text-muted-foreground">No courses found. Upload a CSV or adjust your search query.</p>
          ) : null}

          {!isCoursesLoading && courses.length > 0 ? (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">University</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-t">
                      <td className="p-3 font-medium">{course.title || 'Untitled course'}</td>
                      <td className="p-3">{course.university || '-'}</td>
                      <td className="p-3">{course.category || '-'}</td>
                      <td className="p-3">{course.level || '-'}</td>
                      <td className="p-3">{course.instructor || '-'}</td>
                      <td className="p-3">{course.duration_weeks ? `${course.duration_weeks} months` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
