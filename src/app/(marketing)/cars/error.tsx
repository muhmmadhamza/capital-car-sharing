"use client";

import { Button } from "@/components/ui/Button";
import { ConnectionNotice } from "@/components/ui/ConnectionNotice";
import { Container } from "@/components/ui/Container";

/** Shown when a cars page could not load its data from the API. */
export default function CarsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-16 lg:py-24">
      <ConnectionNotice title="We couldn't load this page" message="The server didn't answer. Check your connection and try again.">
        <Button variant="outline-navy" onClick={reset}>
          Try again
        </Button>
        <Button href="/cars" variant="outline-navy" className="ml-3">
          All cars
        </Button>
      </ConnectionNotice>
    </Container>
  );
}
