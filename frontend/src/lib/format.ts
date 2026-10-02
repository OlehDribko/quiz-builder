export function formatQuestionCount(count: number): string {
  return `${count} ${count === 1 ? "question" : "questions"}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
