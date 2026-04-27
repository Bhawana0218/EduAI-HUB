'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CourseMatchInputSchema } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';
import Link from 'next/link';

type CourseMatchInput = z.infer<typeof CourseMatchInputSchema>;

type BackendRecommendation = {
  title: string;
  university?: string;
  provider?: string;
  reason?: string;
  description?: string;
  level?: string;
  matchScore?: number;
  _id?: string;
  uniqueId?: string;
};

type RecommendationItem = {
  courseName: string;
  universityName: string;
  matchScore: number;
  rationale: string;
  id?: string;
};

type CourseMatchOutput = {
  suggestions: RecommendationItem[];
};


const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const RECOMMEND_ENDPOINT = `${API_BASE_URL}/recommendations`; // Aligns with app.js routing

export default function CourseMatchPage() {
  const [recommendations, setRecommendations] = useState<CourseMatchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseMatchInput>({
    resolver: zodResolver(CourseMatchInputSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: CourseMatchInput) {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const response = await fetch(RECOMMEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: values.description,
          level: 'Any',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to generate recommendations.');
      }

      // Robust payload parsing for different backend structures
      const rawList: BackendRecommendation[] = 
        Array.isArray(payload) 
          ? payload 
          : Array.isArray(payload.data) 
          ? payload.data 
          : Array.isArray(payload.recommendations) 
          ? payload.recommendations : 
        [];

      const suggestions = rawList.slice(0, 5).map((item, index) => {
  const score =
    typeof item.matchScore === 'number'
      ? Math.max(0, Math.min(100, item.matchScore))
      : Math.max(60, 90 - index * 5);

  return {
    courseName: item.title || 'Unknown Course',
    universityName: item.university || item.provider || 'Unknown University',
    matchScore: score,
    rationale: item.reason || 'Matched based on your profile',
    id: item.uniqueId || item._id,
  };
});

      if (!suggestions.length) {
        throw new Error('No recommendations found. Please try a more detailed description.');
      }

      setRecommendations({ suggestions });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred while generating recommendations. Please try again.';
      setError(message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const exampleDescription = "I'm a high school student with strong grades in Math and Physics. I love coding, building small robots, and I'm fascinated by artificial intelligence. I'm looking for an undergraduate program at a top-tier university, preferably in the US, that has a great reputation for engineering and a vibrant campus life.";

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          AI Course Match
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe your interests, academic background, and what you're looking for in a course. Our AI will suggest the best matches for you.
        </p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Your Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I'm interested in environmental science and want a hands-on program...'"
                        className="min-h-[150px] mt-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-accent mt-2"
                onClick={() => form.setValue('description', exampleDescription)}>
                Use an example
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Find My Courses
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
        <div className="mt-8 text-center text-destructive bg-destructive/10 p-4 rounded-md">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="mt-12">
          <h2 className="font-headline text-3xl font-bold mb-6 text-center text-primary">Your Recommended Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.suggestions.map((rec, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{rec.courseName}</CardTitle>
                  <CardDescription>{rec.universityName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> Match Score</span>
                      <Badge variant={rec.matchScore > 80 ? 'default' : 'secondary'} className="bg-accent text-accent-foreground">{rec.matchScore}%</Badge>
                    </div>
                    <Progress value={rec.matchScore} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">
                    <span className="font-semibold text-primary">Rationale:</span> {rec.rationale}
                  </p>
                  {rec.id && (
                    <div className="pt-4 mt-auto">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/courses/${rec.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
