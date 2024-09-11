import { H1 } from "@/components/ui/H1";
import { H2 } from "@/components/ui/H2";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Me",
  description: "Learn more about Florian Walther and his work.",
};

export default function Page() {
  return (
    <section className="space-y-6">
      <H1>About Me</H1>
      <section className="space-y-3">
        <H2>Who am I?</H2>
        <p>
          I am software engineer with about 2 years of experience, specializing
          in backend development and leveraging AI technologies and cloud
          services. Adept at building scalable, secure systems and fine-tuning
          AI solutions to solve complex problems. Passionate about leveraging
          modern tech stacks to drive high-quality, impactful solutions in
          dynamic, cross-functional teams. .
        </p>
        <p>
          I&apos;m passionate about building cool apps and exploring new
          technologies. I love to learn and grow as a developer, and I am always
          looking for new challenges and opportunities to push myself.
        </p>
      </section>
      <hr className="border-muted" />
      <section className="space-y-3">
        <H2>Skills</H2>
        <p>
          I&apos;m a full-stack web developer specializing in
          <strong>Node.js</strong>.
        </p>
        <p>
          Experienced in front-end work with React, Next.js, and TypeScript,
          alongside backend skills in Node.js, MongoDB, PostgreSQL, and REST
          APIs. Comfortable with blockchain tools like Solidity and Hardhat, and
          working with AWS for cloud computing. I&apos;m familiar with testing
          and deployment using Jest, Mocha, and Docker, plus everyday tools like
          Git and Linux. I also have experience with AI tools like Langchain and
          OpenRouter.
        </p>
      </section>
      <hr className="border-muted" />
      <section className="space-y-3">
        <H2>Side projects</H2>
        <p>
          In my free time, I like to work on side projects to keep my skill
          sharp and try out new tech. Here is a list of my current projects:
        </p>
        <ul className="list-inside list-disc">
          <li>
            <a
              href="https://vercelclone.vercel.app/"
              className="text-primary hover:underline"
            >
              Full-Stack Vercel Clone
            </a>{" "}
          </li>
          <li>
            <Link
              href="https://books-ai.app"
              className="text-primary hover:underline"
            >
              Pugs Quest
            </Link>
          </li>
          <span>-Mini-app built on top of telegram</span>
        </ul>
      </section>
      <hr className="border-muted" />
      <section className="space-y-3">
        <H2>Hobbies</H2>
        <p>
          Besides programming, I am a hobbyist Powerlifter. I also enjoy
          Kickboxing. I also enjoy reading books and learning new stuff about
          life. I think having hobbies other than coding is important for mental
          health.
        </p>
        <p>
          I&apos;m also very much into self-improvement, positive psychology.
        </p>
      </section>
    </section>
  );
}
