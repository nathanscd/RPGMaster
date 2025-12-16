export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="Section">
      <h2 className="font-bold text-lg">{title}</h2>
      {children}
    </section>
  )
}
