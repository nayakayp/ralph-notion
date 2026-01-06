import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Zap, Shield } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const features = [
    {
      icon: <FileText className="w-10 h-10 text-primary" />,
      title: "Rich Text Editing",
      description:
        "Create beautiful documents with our powerful block-based editor supporting rich text, images, and embeds.",
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "Collaborative Workspaces",
      description:
        "Work together in real-time with your team. Share pages, leave comments, and collaborate seamlessly.",
    },
    {
      icon: <Zap className="w-10 h-10 text-primary" />,
      title: "Lightning Fast",
      description:
        "Built with performance in mind. Instant page loads, smooth animations, and responsive interactions.",
    },
    {
      icon: <Shield className="w-10 h-10 text-primary" />,
      title: "Type-Safe",
      description:
        "End-to-end type safety with TypeScript. Catch errors early and ship with confidence.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            NotionV2
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Your ideas, documents, and plans - together in one place.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A modern Notion clone built with TanStack Start, featuring
            collaborative workspaces, rich text editing, and real-time updates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Built with Modern Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "TanStack Start",
              "TanStack Router",
              "TanStack Query",
              "Shadcn UI",
              "Tailwind CSS",
              "Zustand",
              "Slate.js",
              "Framer Motion",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-background border rounded-full text-sm font-medium text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
