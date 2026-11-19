"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Cupboard from "@/components/cupboard";
import PromptInput from "@/components/promptInput";
import { Footer } from "@/components/footer";

export default function TestPage() {
  const [isCupboardOpen, setIsCupboardOpen] = useState(false);

  return (
    <div className="test-page">
      <div className="test-page__rail">
        <Sidebar
          plan="free"
          onNewChat={() => console.log("new chat")}
          onCupboard={() => setIsCupboardOpen(true)}
          onSelectChat={(id) => console.log("select", id)}
          onUpgrade={() => console.log("upgrade")}
        />

        <div
          className={`test-page__cupboard${
            isCupboardOpen ? " test-page__cupboard--open" : ""
          }`}
        >
          <Cupboard onClose={() => setIsCupboardOpen(false)} />
        </div>
      </div>

      <div className="test-page__main">
        <main className="test-page__content">
          <h1>Component Test Bench</h1>
          <p>Scratch page for previewing components in isolation.</p>

          <div className="test-page__prompt">
            <PromptInput
              email="example@gmail.com"
              onSubmit={(value) => console.log("submit:", value)}
              onChange={(value) => console.log("change:", value)}
            />
          </div>
        </main>

        {/* <Footer /> */}
      </div>
    </div>
  );
}