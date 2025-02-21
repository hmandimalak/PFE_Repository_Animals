"use client";
import Link from 'next/link';
import HomePage from "../app/pages/HomePage";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (

    <SessionProvider>
    <HomePage />
  </SessionProvider>
);
}
