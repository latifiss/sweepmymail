'use client'

import Image from "next/image";
import styles from "./page.module.css";
import FontExample from "../components/font-example";
import { ActionsRow } from "@/components/actionsRow";
import { UnreadTag } from "@/components/unread";
import Cell from "@/components/cell";
import { useState } from "react";
import PricingPopup from "@/components/pricingPopup";
import Guide from "@/components/guide";
import Bloc from "@/components/bloc";
import LoadingModal from "@/components/loader";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
          <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 20px',
          borderRadius: '999px',
          background: '#0a6f50',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Show Pricing Update
      </button>

      {isOpen && (
        <PricingPopup onClose={() => setIsOpen(false)} />
          )}
          {/* <LoadingModal isOpen={true} /> */}
          <LoadingModal 
  isOpen={true} 
  message="Deleting item..." 
  color="#dc3545" 
/>

           <Bloc 
        title="Categorize" 
        caption="Organize your content into custom categories for better management" 
        type="categorize" 
      />

      {/* Summary Bloc */}
      <Bloc 
        title="Summary" 
        caption="Get AI-powered summaries of your content and activities" 
        type="summary" 
      />

      {/* Priority List Bloc */}
      <Bloc 
        title="Priority List" 
        caption="Manage and track your high-priority tasks efficiently" 
        type="list" 
      />
    </>
        <div className={styles.intro}>
          <h1>To get started, edit the page.tsx file.</h1>
          <p>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>

        {/* Font Example Component */}
        <Cell />
        <Guide/>
        <ActionsRow />
        <UnreadTag/>
        <FontExample />

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
