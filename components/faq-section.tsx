import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16">FAQ</h2>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              Who is this for?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              For borderless nomads who want momentum, not early friction. Built from problems we faced ourselves — now
              solved in our home city.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              Who is this not for?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li>• Tourists looking for a guide</li>
                <li>• Businesses seeking relocation services</li>
                <li>• Anyone needing professional visa, tax, or legal services</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              Who's behind LocalNomad? Do you live in Seoul?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We're slowmads based in Seoul. One of us is Korea-born and raised; the other recently moved their base to
              Seoul.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              I just made the purchase. What now?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Check your inbox. You'll receive all guides (except the area orientation guide, which is customized after
              accommodation choice). You'll also receive a link to schedule your call.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              Can't I just figure this out myself?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p className="mb-3">You absolutely can.</p>
              <p className="mb-3">That's why we offer a free curated list of local resources — to help you get started on your own.</p>
              <p>LocalNomad is for people who don't want to spend their first weeks verifying generated information, comparing options, or learning through trial and error. We help you move forward with clarity and confidence.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              What's the difference between the 72 hours and 14 days plans?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p className="mb-3">The 72 hours plan helps you land.<br />The 14 days plan helps you feel settled.</p>
              <p className="mb-3">The 72 hours plan is designed for immediate needs right after arrival.</p>
              <p>The 14 days plan is for people who want ongoing guidance — enough time to understand their options, ask questions, and feel confident about where and how they settle in.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-4 sm:px-6">
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
              How do I know your content won't be outdated or incomplete?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p className="mb-3">Our guidance doesn't stop at static content.</p>
              <p>Within the scope of what you purchase, you can ask unlimited questions — so we make sure the information stays relevant, complete, and tailored to your situation.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
