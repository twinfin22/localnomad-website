"use client";

import Link from "next/link";
import { FileText, MapPin, Stamp, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

const services = [
  {
    icon: FileText,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Info Bundles",
    description: "Essential guides for your Korea journey",
    price: "From $19",
    features: [
      "Pre-arrival checklists",
      "Seoul survival playbook",
      "Digital nomad cheatsheets",
      "Banking & phone setup guides",
    ],
    href: "/bundles",
    cta: "Browse Bundles",
  },
  {
    icon: MapPin,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    title: "Area Guide",
    description: "Find your perfect neighborhood",
    price: "From $99",
    features: [
      "Interactive Seoul map",
      "Neighborhood deep-dives",
      "Custom housing reports",
      "48-hour turnaround",
    ],
    href: "/areas",
    cta: "Explore Areas",
  },
  {
    icon: Stamp,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Visa Dashboard",
    description: "Navigate Korean visa requirements",
    price: "Free",
    features: [
      "D-10, E-7, F-2 visa guides",
      "Digital Nomad visa info",
      "Step-by-step checklists",
      "Document requirements",
    ],
    href: "/visa",
    cta: "View Visa Info",
  },
];

export function ServicesDetailSection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-4">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From pre-arrival prep to long-term settlement
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <AnimatedSection key={service.href}>
              <div className="group bg-card border border-border rounded-2xl p-6 lg:p-8 h-full flex flex-col card-lift shadow-navy hover:shadow-navy-lg hover:border-primary/30 transition-all duration-300 card-accent-left overflow-hidden cursor-pointer">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-primary mb-5">
                  {service.price}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={service.href}>
                  <Button
                    variant="outline"
                    className="w-full group/btn border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
