import { NextRequest, NextResponse } from "next/server";
import { getResumeData } from "@/server/db/resume";
import { getFeaturedProjects } from "@/server/db/projects";
import { getMarkdownExcerpt } from "@/lib/markdown";
import ReactPDF from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

// Stylesheet mapping to modern clean resume formatting
const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 10,
    color: "#334155",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 3,
  },
  title: {
    fontSize: 12,
    color: "#0f766e",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 3,
    color: "#475569",
    fontSize: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 2,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  experienceItem: {
    marginBottom: 4,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  itemHeaderLabel: {
    flex: 1,
    paddingRight: 8,
  },
  itemHeaderDate: {
    width: 100,
    fontSize: 9,
    color: "#475569",
    textAlign: "right",
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  itemTitle: {
    fontSize: 10,
    color: "#334155",
    fontStyle: "italic",
    marginBottom: 2,
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletPoint: {
    width: 6,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.25,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillLabel: {
    width: 70,
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  skillValue: {
    flex: 1,
    fontSize: 10,
    color: "#334155",
  },
  projectItem: {
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  projectTagsInline: {
    fontSize: 9,
    color: "#0f766e",
  },
  projectDescription: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.25,
    marginTop: 1,
  },
  projectLinks: {
    flexDirection: "row",
    columnGap: 6,
    width: 120,
    justifyContent: "flex-end",
  },
  projectLink: {
    fontSize: 9,
    color: "#0f766e",
    textDecoration: "none",
  },
});

function ResumePdfDocument({ data, projects }: { data: any; projects: any[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.full_name}</Text>
          <Text style={styles.title}>Junior Software Engineer & Full-Stack Developer</Text>
          <View style={styles.contactRow}>
            <Text style={{ fontSize: 8 }}>Email: {data.contact.email}</Text>
            <Text style={{ fontSize: 8 }}>Phone: {data.contact.phone}</Text>
            <Text style={{ fontSize: 8 }}>Location: {data.contact.location}</Text>
            <Text style={{ fontSize: 8 }}>LinkedIn: {data.contact.linkedin}</Text>
            <Text style={{ fontSize: 8 }}>GitHub: {data.contact.github}</Text>
          </View>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{data.summary}</Text>
          </View>
        )}

        {data.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {data.skills.languages?.length > 0 && (
              <View style={styles.skillRow}>
                <Text style={styles.skillLabel}>Languages:</Text>
                <Text style={styles.skillValue}>{data.skills.languages.join(", ")}</Text>
              </View>
            )}
            {data.skills.frameworks?.length > 0 && (
              <View style={styles.skillRow}>
                <Text style={styles.skillLabel}>Frameworks:</Text>
                <Text style={styles.skillValue}>{data.skills.frameworks.join(", ")}</Text>
              </View>
            )}
            {data.skills.tools?.length > 0 && (
              <View style={styles.skillRow}>
                <Text style={styles.skillLabel}>Tools:</Text>
                <Text style={styles.skillValue}>{data.skills.tools.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project: any, index: number) => (
              <View key={index} style={styles.projectItem} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemHeaderLabel}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    {project.tags?.length > 0 && (
                      <Text style={styles.projectTagsInline}>  —  {project.tags.join(", ")}</Text>
                    )}
                  </Text>
                  {(project.live_url || project.github_url) && (
                    <View style={styles.projectLinks}>
                      {project.live_url && (
                        <Link src={project.live_url} style={styles.projectLink}>Live Demo</Link>
                      )}
                      {project.github_url && (
                        <Link src={project.github_url} style={styles.projectLink}>GitHub</Link>
                      )}
                    </View>
                  )}
                </View>
                {project.description && (
                  <Text style={styles.projectDescription}>{getMarkdownExcerpt(project.description, 220)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp: any, index: number) => (
            <View key={index} style={styles.experienceItem} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={[styles.companyName, styles.itemHeaderLabel]}>{exp.company}</Text>
                <Text style={styles.itemHeaderDate}>{exp.period}</Text>
              </View>
              <Text style={styles.itemTitle}>{exp.title}</Text>
              <View style={styles.bulletList}>
                {exp.bullets.slice(0, 2).map((bullet: string, bIndex: number) => (
                  <View key={bIndex} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 5 }} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={[{ fontSize: 10, fontWeight: "bold" }, styles.itemHeaderLabel]}>{edu.institution}</Text>
                <Text style={styles.itemHeaderDate}>{edu.period}</Text>
              </View>
              <Text style={{ fontSize: 9, color: "#334155" }}>{edu.degree} {edu.gpa ? `(CGPA: ${edu.gpa})` : ""}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const [resumeData, featuredProjects] = await Promise.all([
      getResumeData({ username }),
      getFeaturedProjects({ username }),
    ]);
    const projects = featuredProjects.slice(0, 4);
    const pdfStream = await ReactPDF.renderToStream(<ResumePdfDocument data={resumeData} projects={projects} />);
    
    // Convert stream to Buffer
    const chunks: any[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const fileName = `Resume_${(resumeData.full_name || "Resume").replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
