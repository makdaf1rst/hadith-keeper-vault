import SwiftUI
import WidgetKit

private struct Hadith: Codable {
    let n: Int
    let en: String
    let bn: String
}

private struct HadithEntry: TimelineEntry {
    let date: Date
    let hadith: Hadith
    let bengali: Bool
}

private struct Provider: TimelineProvider {
    private let fallback = Hadith(n: 1, en: "Actions are only by intentions.", bn: "নিশ্চয়ই সকল কাজ নিয়তের উপর নির্ভরশীল।")

    private func entry(for date: Date) -> HadithEntry {
        let data = Bundle.main.url(forResource: "daily-hadith", withExtension: "json")
            .flatMap { try? Data(contentsOf: $0) }
        let hadiths = data.flatMap { try? JSONDecoder().decode([Hadith].self, from: $0) } ?? [fallback]
        let day = Calendar.current.ordinality(of: .day, in: .year, for: date) ?? 1
        let hadith = hadiths[(day - 1) % hadiths.count]
        // ponytail: No App Group, so a Bengali reader on an English phone gets English; add one if anyone asks.
        let bengali = Locale.preferredLanguages.first?.lowercased().hasPrefix("bn") == true
        return HadithEntry(date: date, hadith: hadith, bengali: bengali)
    }

    func placeholder(in context: Context) -> HadithEntry { entry(for: Date()) }
    func getSnapshot(in context: Context, completion: @escaping (HadithEntry) -> Void) { completion(entry(for: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<HadithEntry>) -> Void) {
        let now = Date()
        let midnight = Calendar.current.nextDate(after: now, matching: DateComponents(hour: 0, minute: 0), matchingPolicy: .nextTime) ?? now.addingTimeInterval(86_400)
        completion(Timeline(entries: [entry(for: now)], policy: .after(midnight)))
    }
}

private struct HadithWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: HadithEntry

    private var content: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.bengali ? "দৈনিক হাদিস" : "Daily Hadith")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(entry.bengali ? entry.hadith.bn : entry.hadith.en)
                .font(family == .systemSmall ? .caption : .subheadline)
                .lineLimit(family == .systemSmall ? 6 : 5)
                .foregroundStyle(.primary)
            Spacer(minLength: 0)
            Text(entry.bengali ? "হাদিস \(entry.hadith.n)" : "Hadith \(entry.hadith.n)")
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
        }
        .padding()
        .widgetURL(URL(string: "jamialkamil://hadith/\(entry.hadith.n)"))
    }

    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(.background, for: .widget)
        } else {
            content.background(Color(.systemBackground))
        }
    }
}

@main
struct DailyHadithWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DailyHadithWidget", provider: Provider()) { entry in
            HadithWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Hadith")
        .description("A hadith from Jāmiʿ al-Kāmil each day.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
