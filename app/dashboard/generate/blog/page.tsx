"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ResearchGather from '@/components/Research/research-gather'
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Globe,
  Edit3,
  Eye,
  Save,
  Calendar,
  Send,
  Plus,
  Filter,
  Palette,
  Monitor,
  Smartphone,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  ExternalLink,
} from "lucide-react"

interface BlogPost {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  views: number;
  date: string;
}

export default function BlogGeneratorPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editorMode, setEditorMode] = useState("edit") // 'edit' or 'preview'
  const [mobilePreview, setMobilePreview] = useState(false)
  const [generatedBlog, setGeneratedBlog] = useState<{ id: string; title: string; content: string; status: string } | null>(null)
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");





  // Dynamically loaded posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Fetch initial posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          const formatted = (data as any[]).map((row) => ({
            id: row.id,
            title: row.title,
            status: row.status,
            views: row.views ?? 0,
            date: row.created_at ? row.created_at.split('T')[0] : ''
          }));
          setBlogPosts(formatted);
        } else {
          console.error('Error fetching posts', error);
        }
      }
    };
    fetchPosts();
  }, []);

  // Handle newly generated blog
  useEffect(() => {
    if (generatedBlog) {
      console.log("New blog generated, updating UI:", generatedBlog);
      const newPost: BlogPost = {
        id: generatedBlog.id,
        title: generatedBlog.title,
        status: (generatedBlog as any).status || 'draft',
        views: 0,
        date: new Date().toISOString().split('T')[0]
      };

      // Add new post to the list and select it
      // This ensures the list is updated without a full refetch
      setBlogPosts(prevPosts => [newPost, ...prevPosts.filter(p => p.id !== newPost.id)]);
      setSelectedPost(newPost);
    }
  }, [generatedBlog]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedPost) {
        setEditorTitle('');
        setEditorContent('');
        return;
      }

      // If the selected post is the one we just generated, use its content directly
      if (generatedBlog && selectedPost.id === generatedBlog.id) {
        setEditorTitle(generatedBlog.title);
        setEditorContent(generatedBlog.content);
      } else {
        // Otherwise, fetch the content from the database
        setEditorTitle(selectedPost.title);
        setEditorContent('Loading...');
        const { data, error } = await supabase
          .from('blog_posts')
          .select('html_content')
          .eq('id', selectedPost.id)
          .single();

        if (error) {
          console.error('Error fetching post content:', error);
          setEditorContent('Error loading content.');
        } else {
          setEditorContent(data.html_content || '');
        }
      }
    };

    fetchContent();
  }, [selectedPost]);

  const handlePublish = async () => {
    if (!selectedPost) {
      alert("Please select a post to publish.");
      return;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({ status: 'published' })
      .eq('id', selectedPost.id);

    if (error) {
      alert(`Error publishing post: ${error.message}`);
    } else {
      alert("Post published successfully!");

      const updatedPost = { ...selectedPost, status: 'published' as const };

      setBlogPosts(blogPosts.map(p => p.id === selectedPost.id ? updatedPost : p));
      setSelectedPost(updatedPost);

      console.log('Post published successfully');
    }
  };

  const handleSave = async () => {
    if (!selectedPost) return;

    const { data, error } = await supabase
      .from('blog_posts')
      .update({ title: editorTitle, html_content: editorContent, content: editorContent })
      .eq('id', selectedPost.id)
      .select()
      .single();

    if (error) {
      console.error('Error saving post:', error);
    } else {
      console.log('Post saved successfully');
      const updatedPost = { ...selectedPost, title: data.title };
      setBlogPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === selectedPost.id ? updatedPost : p
        )
      );
      setSelectedPost(updatedPost);
    }
  };

  const templates = [
    { id: 1, name: "Minimal", preview: "/placeholder.svg?height=200&width=300", category: "Clean" },
    { id: 2, name: "Professional", preview: "/placeholder.svg?height=200&width=300", category: "Business" },
    { id: 3, name: "Creative", preview: "/placeholder.svg?height=200&width=300", category: "Design" },
    { id: 4, name: "Tech Blog", preview: "/placeholder.svg?height=200&width=300", category: "Technology" },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Research input */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <ResearchGather onBlogGenerated={setGeneratedBlog} showVisitSiteButton={false} />


      </div>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Blog Dashboard</h1>
              {/* Hidden: Domain badge - logic preserved but not rendered */}
            </div>
            {/* Hidden: Visit Live Site buttons - logic preserved but not rendered */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Hidden: Post Selection Sidebar - logic preserved but not rendered */}

          {/* Main Editor Area - Now full width */}
          <div>
            <Tabs defaultValue="editor" className="space-y-6">
              <TabsList className="bg-gray-900 border border-gray-800">
                <TabsTrigger value="editor" className="data-[state=active]:bg-gray-800">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editor
                </TabsTrigger>

              </TabsList>

              {/* Editor Tab */}
              <TabsContent value="editor" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Live Editor</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="preview-mode" className="text-sm">
                            Preview
                          </Label>
                          <Switch
                            id="preview-mode"
                            checked={editorMode === "preview"}
                            onCheckedChange={(checked) => setEditorMode(checked ? "preview" : "edit")}
                          />
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center space-x-2">
                          {/* Hidden: Save and Publish buttons - logic preserved but not rendered */}
                          <Button
                            variant={mobilePreview ? "outline" : "default"}
                            size="sm"
                            onClick={() => setMobilePreview(false)}
                          >
                            <Monitor className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={mobilePreview ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMobilePreview(true)}
                          >
                            <Smartphone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Post Title */}
                    <div className="space-y-2">
                      <Label htmlFor="post-title">Post Title</Label>
                      <Input
                        id="blog-title"
                        placeholder="Enter your blog title here..."
                        className="text-2xl font-bold bg-transparent border-0 focus:ring-0 p-0 shadow-none"
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                      />
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                      <Label htmlFor="post-content">Content</Label>
                      {editorMode === "edit" ? (
                        <div className="space-y-3">

                          <Textarea
                            id="blog-content"
                            placeholder="Start writing your amazing blog post..."
                            className="min-h-[400px] bg-transparent border-0 focus:ring-0 p-0 resize-none text-lg"
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div
                          className={`min-h-[400px] p-6 bg-white text-gray-900 rounded-lg overflow-auto ${mobilePreview ? "max-w-sm mx-auto" : ""}`}
                        >
                          <style>{`
                            .blog-preview h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #111; }
                            .blog-preview h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #222; }
                            .blog-preview h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #333; }
                            .blog-preview p { color: #444; line-height: 1.75; margin-bottom: 1rem; }
                            .blog-preview ul, .blog-preview ol { padding-left: 1.5rem; margin-bottom: 1rem; }
                            .blog-preview ul { list-style-type: disc; }
                            .blog-preview ol { list-style-type: decimal; }
                            .blog-preview li { margin-bottom: 0.5rem; color: #444; }
                            .blog-preview strong, .blog-preview b { font-weight: 600; color: #111; }
                            .blog-preview em, .blog-preview i { font-style: italic; }
                            .blog-preview a { color: #2563eb; text-decoration: underline; }
                            .blog-preview blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #666; font-style: italic; margin: 1rem 0; }
                            .blog-preview code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.9em; }
                            .blog-preview pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
                          `}</style>
                          <article className="blog-preview">
                            {editorTitle && !editorContent.includes('<h1>') && (
                              <h1>{editorTitle}</h1>
                            )}
                            <div dangerouslySetInnerHTML={{ __html: editorContent || '<p style="color: #999; font-style: italic;">Your blog content will appear here. Toggle to Preview mode to see rendered HTML.</p>' }} />
                          </article>
                        </div>
                      )}
                    </div>

                    {/* Hidden: Publishing Controls - Save and Publish buttons - logic preserved but not rendered */}
                  </CardContent>
                </Card>
              </TabsContent>



              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Analytics chart will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle>Top Performing Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {blogPosts.map((post, index) => (
                          <div key={post.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-white">{post.title}</p>
                              <p className="text-sm text-gray-400">{post.views} views</p>
                            </div>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
