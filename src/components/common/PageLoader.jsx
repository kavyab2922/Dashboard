/**
 * PageLoader — wraps page content so that:
 * - While loading: shows a subtle centered spinner, content is invisible but in DOM
 * - When loaded: content fades in smoothly, no DOM swap = no blink
 *
 * Usage:
 *   <PageLoader loading={loading}>
 *     <YourContent />
 *   </PageLoader>
 */
export default function PageLoader({ loading, children, minHeight = '200px' }) {
  return (
    <div className="relative">
      {/* Always-in-DOM content — avoids unmount/remount blink */}
      <div style={{
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.25s ease',
        pointerEvents: loading ? 'none' : 'auto',
      }}>
        {children}
      </div>

      {/* Spinner overlay — fades out when loading done */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        opacity: loading ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2.5px solid rgba(99,102,241,0.15)',
            borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Loading…</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
