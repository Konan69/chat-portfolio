import { H1 } from "@/components/ui/H1";
import { H2 } from "@/components/ui/H2";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Media",
  description: "My social media channels and how to work with me.",
};

export default function Page() {
  return (
    <section className="space-y-6">
      <H1>Social Media</H1>
      <section className="space-y-3">
        <H2></H2>
        <p></p>
        <p>Links to all my social accounts:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <a
              href="https://www.youtube.com/codinginflow?sub_confirmation=1"
              className="text-primary hover:underline"
            >
              YouTube
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/codinginflow"
              className="text-primary hover:underline"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href="https://www.tiktok.com/@codinginflow"
              className="text-primary hover:underline"
            >
              TikTok
            </a>
          </li>
          <li>
            <a
              href="https://www.twitter.com/codinginflow"
              className="text-primary hover:underline"
            >
              Twitter
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/codinginflow"
              className="text-primary hover:underline"
            >
              Facebook
            </a>
          </li>
          <li>
            <a
              href="https://www.github.com/codinginflow"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/codinginflow"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://www.codinginflow.com/blog"
              className="text-primary hover:underline"
            >
              Blog
            </a>
          </li>
        </ul>
        <hr className="border-muted" />
      </section>
    </section>
  );
}
