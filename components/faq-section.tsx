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
        </Accordion>
      </div>
    </section>
  )
}
