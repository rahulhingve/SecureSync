"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { LockIcon, MessageCircle, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const features = [
  {
    title: "End-to-End Encryption",
    description:
      "All your messages are encrypted, ensuring only you and your recipient can read them. No one else, not even us.",
    icon: <LockIcon className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Secure Group Chats",
    description:
      "Create encrypted group conversations to collaborate securely with teammates, friends, or family.",
    icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Privacy First",
    description:
      "We don't sell your data or show ads. Your conversations remain private and secure at all times.",
    icon: <Shield className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Lightning Fast",
    description:
      "Enjoy a responsive and fast messaging experience while maintaining the highest security standards.",
    icon: <Zap className="w-6 h-6 text-blue-500" />,
  },
];

export function LandinPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Header/Navigation */}
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LockIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SecureSync</h1>
        </div>
        <div className="flex space-x-4 items-center">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Secure Messaging for Everyone
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
              End-to-end encrypted communication that keeps your conversations private and secure. No one can read your messages, not even us.
            </p>
            <Link
              href="/login"
              className="px-8 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all text-lg flex items-center w-fit"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="w-[300px] md:w-[400px] h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-100 dark:border-gray-700">
              <div className="bg-blue-600 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <LockIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-bold">SecureSync</h3>
                    <p className="text-blue-200 text-sm">End-to-end encrypted</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex justify-end mb-2">
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                      Hey there! How are you doing?
                    </div>
                  </div>
                  <div className="flex justify-start mb-2">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg rounded-tl-none max-w-[80%] dark:text-white">
                      I'm great, thanks! How about you?
                    </div>
                  </div>
                  <div className="flex justify-end mb-2">
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                      Good! Just checking the new secure chat app. Pretty cool so far!
                    </div>
                  </div>
                  <div className="flex justify-start mb-2">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg rounded-tl-none max-w-[80%] dark:text-white">
                      Yeah, I love that it's end-to-end encrypted!
                    </div>
                  </div>
                  <div className="flex justify-end mb-2">
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                      <LockIcon className="w-4 h-4 inline mr-1" /> Totally secure!
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900 rounded-3xl -mt-10 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Why Choose SecureSync?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-8 px-4 mt-auto">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-16 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <LockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              © {new Date().getFullYear()} SecureSync
            </span>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}