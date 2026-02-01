import { Link } from "react-router-dom";
import { Dna, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Daily Tasks", href: "/tasks" },
    { label: "Analytics", href: "/analytics" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Support", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-[#0A0A0F] border-t border-white/[0.05]">
      {/* Gradient glow at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <Dna className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Skill<span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Genome</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Map your skills as a living genome. Identify weaknesses with AI precision.
              Evolve daily through personalized challenges.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 text-sm hover:text-violet-400 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-violet-400 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-violet-400 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Skill Genome. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Built with
            <span className="text-violet-400">♥</span>
            for developers who evolve
          </p>
        </div>
      </div>
    </footer>
  );
};
