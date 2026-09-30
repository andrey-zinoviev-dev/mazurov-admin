import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatEstimateMoney,
  type EstimateDoc,
  type EstimateSection,
} from "@/lib/estimate-model";
import { getEstimateLogoPath, registerEstimateFonts } from "./register-fonts";

registerEstimateFonts();

/** Единый горизонтальный отступ текста в шапке, таблице и подвале. */
const GUTTER = 28;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: GUTTER,
  },
  headerLeft: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 16,
    gap: 3,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  headerLine: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#ffffff",
  },
  headerRight: {
    alignItems: "center",
    flexShrink: 0,
    gap: 4,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "cover",
  },
  smetaLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000000",
    color: "#ffffff",
  },
  thName: {
    width: "46%",
    paddingVertical: 5,
    paddingLeft: GUTTER,
    paddingRight: 6,
    fontWeight: 700,
    fontSize: 8,
  },
  thDays: {
    width: "12%",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 8,
    textAlign: "center",
  },
  thQty: {
    width: "12%",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 8,
    textAlign: "center",
  },
  thPrice: {
    width: "15%",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 8,
    textAlign: "center",
  },
  thSum: {
    width: "15%",
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: GUTTER,
    fontWeight: 700,
    fontSize: 8,
    textAlign: "right",
  },
  sectionBar: {
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: GUTTER,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  categoryTitle: {
    backgroundColor: "#ffffff",
    borderLeft: "1px solid #000000",
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
    paddingVertical: 4,
    paddingHorizontal: GUTTER,
    fontWeight: 700,
    fontSize: 9,
  },
  row: {
    flexDirection: "row",
    borderLeft: "1px solid #000000",
    borderRight: "1px solid #000000",
    borderBottom: "1px solid #000000",
  },
  tdName: {
    width: "46%",
    paddingVertical: 4,
    paddingLeft: GUTTER,
    paddingRight: 6,
    borderRight: "1px solid #000000",
  },
  tdDays: {
    width: "12%",
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center",
    borderRight: "1px solid #000000",
  },
  tdQty: {
    width: "12%",
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center",
    borderRight: "1px solid #000000",
  },
  tdPrice: {
    width: "15%",
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center",
    borderRight: "1px solid #000000",
  },
  tdSum: {
    width: "15%",
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: GUTTER,
    textAlign: "right",
  },
  subtotalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: GUTTER,
  },
  subtotalLabel: {
    fontWeight: 700,
    fontSize: 9,
  },
  subtotalValue: {
    fontWeight: 700,
    fontSize: 9,
  },
  footer: {
    marginTop: 0,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: GUTTER,
    backgroundColor: "#000000",
    color: "#ffffff",
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
  },
  footerMid: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
    marginLeft: "auto",
    marginRight: 24,
  },
  footerValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
  },
});

function money(value: number): string {
  return formatEstimateMoney(value);
}

function moneyRub(value: number): string {
  return `${money(value)} ₽`;
}

function SectionBlock({ section }: { section: EstimateSection }) {
  const useSectionTotal =
    section.key === "personnel" || section.key === "admin";

  return (
    <View>
      <Text style={styles.sectionBar}>{section.title}</Text>

      {section.categories.map((category) => (
        <View key={category.title}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.lines.map((line, index) => (
            <View key={`${category.title}-${index}-${line.name}`} style={styles.row}>
              <Text style={styles.tdName}>{line.name}</Text>
              <Text style={styles.tdDays}>{line.days}</Text>
              <Text style={styles.tdQty}>{line.quantity}</Text>
              <Text style={styles.tdPrice}>{money(line.pricePerDay)}</Text>
              <Text style={styles.tdSum}>{money(line.sum)}</Text>
            </View>
          ))}
          {!useSectionTotal ? (
            <View style={styles.subtotalBar}>
              <Text style={styles.subtotalLabel}>Итого {category.title}</Text>
              <Text style={styles.subtotalValue}>{money(category.subtotal)}</Text>
            </View>
          ) : null}
        </View>
      ))}

      {useSectionTotal ? (
        <View style={styles.subtotalBar}>
          <Text style={styles.subtotalLabel}>{section.totalLabel}</Text>
          <Text style={styles.subtotalValue}>{money(section.subtotal)}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function EstimateDocument({ data }: { data: EstimateDoc }) {
  const logoSrc = getEstimateLogoPath();

  return (
    <Document
      title={`Смета №${data.orderNumber}`}
      author={data.contractor}
      language="ru"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber}>Заказ №{data.orderNumber}</Text>
            <Text style={styles.headerLine}>
              Исполнитель: {data.contractor}
            </Text>
            {data.client ? (
              <Text style={styles.headerLine}>Заказчик: {data.client}</Text>
            ) : null}
            {data.project ? (
              <Text style={styles.headerLine}>Проект: {data.project}</Text>
            ) : null}
            {data.orderDates ? (
              <Text style={styles.headerLine}>
                Дата заказа: {data.orderDates}
              </Text>
            ) : null}
            {data.deliveryMethod ? (
              <Text style={styles.headerLine}>
                Тип получения: {data.deliveryMethod}
              </Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Image src={logoSrc} style={styles.logo} />
            <Text style={styles.smetaLabel}>смета</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.thName}>Наименование оборудования</Text>
          <Text style={styles.thDays}>Дней</Text>
          <Text style={styles.thQty}>Кол-во</Text>
          <Text style={styles.thPrice}>Цена/день</Text>
          <Text style={styles.thSum}>Сумма, ₽</Text>
        </View>

        {data.sections.map((section) => (
          <SectionBlock key={section.key} section={section} />
        ))}

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Итог</Text>
            <Text style={styles.footerValue}>{moneyRub(data.techSum)}</Text>
          </View>
          {data.hasDiscount ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Скидка (Техника)</Text>
              <Text style={styles.footerMid}>{data.discountPercent}%</Text>
              <Text style={styles.footerValue}>
                {moneyRub(data.discountAmount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Персонал и доставка</Text>
            <Text style={styles.footerValue}>
              {moneyRub(data.staffAndAdminSum)}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>ОБЩИЙ ИТОГ</Text>
            <Text style={styles.footerValue}>{moneyRub(data.grandTotal)}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>
              Общий итог при оплате на расчетный счет
            </Text>
            <Text style={styles.footerMid}>{data.bankPercent}%</Text>
            <Text style={styles.footerValue}>{moneyRub(data.bankTotal)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
