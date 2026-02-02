import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useEffect, useState } from "react";
import { ebooksApi } from "../../api/ebooks";

const EbookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "openlibrary";
  const [loading, setLoading] = useState(true);
  const [ebook, setEbook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ebooksApi.details({ externalId: id, source });
        setEbook(res?.data?.ebook || res?.ebook || null);
      } catch (e) {
        setError(e?.message || "Failed to load ebook");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, source]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted">Loading...</p>
      </DashboardLayout>
    );
  }
  if (error || !ebook) {
    return (
      <DashboardLayout>
        <p className="text-red-400">{error || "Book not found"}</p>
      </DashboardLayout>
    );
  }

  // Determine download URL and format
  const getDownloadInfo = () => {
    if (ebook.source === 'gutenberg') {
      // For Gutenberg, prefer PDF; if not available, open HTML in browser
      const url = ebook.downloadUrl || "";
      const lower = url.toLowerCase();
      const isPDF = lower.includes('.pdf') || ebook.formats?.some(f => f.toLowerCase().includes('pdf'));
      const isHTML = !isPDF && (lower.endsWith('.htm') || lower.endsWith('.html'));
      return {
        url: ebook.downloadUrl,
        label: isPDF ? 'Download PDF' : isHTML ? 'Read Online (HTML)' : 'Download eBook',
        format: isPDF ? 'PDF' : isHTML ? 'HTML' : 'eBook',
        external: isHTML,
      };
    } else if (ebook.source === 'openlibrary') {
      // For Open Library, link to their web interface where users can download
      const workId = ebook.externalId?.replace('openlibrary_', '') || '';
      return {
        url: ebook.openLibraryUrl || `https://openlibrary.org${workId}`,
        label: 'View & Download on Open Library',
        format: 'Web',
        external: true,
      };
    }
    return null;
  };

  const downloadInfo = getDownloadInfo();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-primary hover:underline"
        >
          ← Back to Free eBooks
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <BookCover src={ebook.coverImage} title={ebook.title} size="xl" />
          </div>

          {/* Book Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{ebook.title}</h1>
            <p className="text-muted mb-4">
              by {(ebook.authors && ebook.authors[0]) || "—"}
            </p>

            {ebook.publishedYear && (
              <p className="text-muted mb-4">Published: {ebook.publishedYear}</p>
            )}

            {ebook.description && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted leading-relaxed">{ebook.description}</p>
              </div>
            )}

            {/* Download Section */}
            <div className="mb-6">
              {downloadInfo && (
                <a
                  href={downloadInfo.url || "#"}
                  target={downloadInfo.external ? "_blank" : "_self"}
                  rel="noreferrer"
                  download={!downloadInfo.external && downloadInfo.format === 'PDF'}
                  className="inline-block px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 transition font-medium mb-3"
                >
                  {downloadInfo.label}
                </a>
              )}

              {/* Show available formats if available */}
              {ebook.formats && ebook.formats.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted mb-2">Available formats:</p>
                  <div className="flex flex-wrap gap-2">
                    {ebook.formats.map((format, idx) => {
                      const formatName = format.includes('pdf') ? 'PDF' 
                        : format.includes('epub') ? 'EPUB'
                        : format.includes('html') ? 'HTML'
                        : format.includes('plain') ? 'TXT'
                        : format.split('/').pop().split(';')[0].toUpperCase();
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-lg text-xs ${
                            format.toLowerCase().includes('pdf')
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-white/10 text-muted'
                          }`}
                        >
                          {formatName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Subject tags */}
            {ebook.subject && ebook.subject.length > 0 && (
              <div>
                <p className="text-sm text-muted mb-2">Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {ebook.subject.slice(0, 5).map((subj, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs bg-white/5 text-muted"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EbookDetails;
