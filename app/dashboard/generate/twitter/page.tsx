"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Twitter, Sparkles, Copy, Check, Hash, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import TwitterPreview from "@/components/twitter/TwitterPreview"

const TWEET_API_BASE = "https://mmheztwkfd.execute-api.ap-south-1.amazonaws.com";

export default function TwitterGeneratorPage() {
    // Form state
    const [topic, setTopic] = useState("")
    const [selectedStyle, setSelectedStyle] = useState("Professional")
    const [tweetLength, setTweetLength] = useState([280])

    // API state
    const [styles, setStyles] = useState<string[]>([])
    const [isLoadingStyles, setIsLoadingStyles] = useState(true)

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedTweet, setGeneratedTweet] = useState("")
    const [characterCount, setCharacterCount] = useState(0)
    const [error, setError] = useState("")

    // Copy state
    const [copied, setCopied] = useState(false)

    // Fetch styles and user preferences on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                // Fetch available styles
                const stylesRes = await fetch(`${TWEET_API_BASE}/api/v1/tweet/styles`);
                if (stylesRes.ok) {
                    const stylesData = await stylesRes.json();
                    setStyles(stylesData.styles || []);
                }

                // Fetch user preferences if authenticated
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    const prefsRes = await fetch(`${TWEET_API_BASE}/api/v1/user/preferences`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    if (prefsRes.ok) {
                        const prefsData = await prefsRes.json();
                        if (prefsData.default_style) {
                            setSelectedStyle(prefsData.default_style);
                        }
                    }
                }
            } catch (err) {
                console.error('Error initializing:', err);
            } finally {
                setIsLoadingStyles(false);
            }
        };

        initialize();
    }, []);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Please enter a topic for your tweet");
            return;
        }

        setIsGenerating(true);
        setError("");
        setGeneratedTweet("");

        // Add timeout for the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session:', session ? 'Found' : 'Not found');

            if (!session?.access_token) {
                throw new Error("Please log in to generate tweets");
            }

            console.log('Sending request to:', `${TWEET_API_BASE}/api/v1/tweet/generate`);
            console.log('Request body:', { topic: topic.trim(), length: tweetLength[0], style: selectedStyle });

            const response = await fetch(`${TWEET_API_BASE}/api/v1/tweet/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic.trim(),
                    length: tweetLength[0],
                    style: selectedStyle
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                let errorMessage = 'Failed to generate tweet';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail) || errorMessage;
                } catch {
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Generated tweet:', data);
            setGeneratedTweet(data.tweet);
            setCharacterCount(data.character_count);

        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error('Tweet generation error:', err);

            if (err.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else if (err.message?.includes('Failed to fetch')) {
                setError('Network error - possibly CORS. Check browser console Network tab.');
            } else {
                setError(err.message || 'An unexpected error occurred');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedTweet) return;

        try {
            await navigator.clipboard.writeText(generatedTweet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Quick topic suggestions
    const topicSuggestions = [
        "AI and Machine Learning trends",
        "Productivity tips for developers",
        "Web3 and blockchain innovations",
        "Remote work culture",
        "Startup growth strategies"
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 mb-4">
                        <Twitter className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Twitter Generator</h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Create engaging, viral-worthy tweets with AI-powered hashtag suggestions
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Panel - Configuration */}
                    <div className="space-y-6">
                        {/* Topic Input Card */}
                        <Card className="bg-gray-900/50 border-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-sky-400" />
                                    Tweet Topic
                                </CardTitle>
                                <CardDescription>What do you want to tweet about?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="e.g., The future of AI in healthcare, Tips for learning to code, My thoughts on remote work..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="bg-gray-800 border-gray-700 min-h-[120px] resize-none focus:border-sky-500 focus:ring-sky-500/20"
                                    maxLength={500}
                                />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{topic.length} / 500 characters</span>
                                </div>

                                {/* Quick Suggestions */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-400 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Quick suggestions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {topicSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setTopic(suggestion)}
                                                className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Style & Length Card */}
                        <Card className="bg-gray-900/50 border-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Hash className="w-5 h-5 mr-2 text-sky-400" />
                                    Style & Length
                                </CardTitle>
                                <CardDescription>Customize your tweet's tone and length</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Style Selector */}
                                <div className="space-y-2">
                                    <Label>Tweet Style</Label>
                                    <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoadingStyles}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700">
                                            <SelectValue placeholder={isLoadingStyles ? "Loading styles..." : "Select a style"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {styles.map((style) => (
                                                <SelectItem key={style} value={style} className="hover:bg-gray-700">
                                                    {style}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Length Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Maximum Length</Label>
                                        <span className="text-sky-400 font-medium">{tweetLength[0]} characters</span>
                                    </div>
                                    <Slider
                                        value={tweetLength}
                                        onValueChange={setTweetLength}
                                        min={50}
                                        max={280}
                                        step={10}
                                        className="py-2"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Short (50)</span>
                                        <span>Optimal (150-200)</span>
                                        <span>Max (280)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic.trim()}
                            className="w-full h-14 text-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-sky-500/25"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Tweet...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Tweet
                                </>
                            )}
                        </Button>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Tweet Preview</h2>
                            {generatedTweet && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="border-gray-700 hover:bg-gray-800"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2 text-green-400" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Tweet
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        <TwitterPreview content={generatedTweet} characterCount={characterCount} />

                        {/* Tips Section */}
                        <Card className="bg-gray-900/30 border-gray-800/50">
                            <CardContent className="pt-4">
                                <h3 className="text-sm font-medium text-gray-300 mb-3">💡 Tips for Better Tweets</h3>
                                <ul className="text-sm text-gray-500 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        Keep it concise - shorter tweets often perform better
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        Use 2-3 relevant hashtags for maximum visibility
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        Ask questions to encourage engagement
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        Add emojis strategically to catch attention
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
