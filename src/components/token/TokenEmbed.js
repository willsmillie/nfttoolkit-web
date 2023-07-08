import { useState, useEffect } from 'react';
import Ratio from 'react-ratio';
import { ipfsToHttp } from '../../utils/ipfs';

export default function TokenEmbed({ metadata }) {
  const [embedComponent, setEmbedComponent] = useState(null);
  const checkContentType = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return contentType;
    } catch (error) {
      console.error('Error checking content type:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAndRenderEmbed = async () => {
      const url = ipfsToHttp(metadata?.animation_url ?? metadata?.image);
      const contentType = await checkContentType(url);

      if (contentType) {
        if (contentType.startsWith('video/')) {
          // Video component
          setEmbedComponent(
            <div style={{ width: '100%', height: '100%' }}>
              <video controls style={{ width: '100%', height: '100%' }}>
                <source src={url} />
              </video>
            </div>
          );
        } else if (contentType.startsWith('image/')) {
          // Image component
          setEmbedComponent(<img src={url} alt={metadata?.name ?? ''} />);
        } else if (contentType.startsWith('text/html')) {
          // Embed component
          setEmbedComponent(
            <embed
              alt={metadata?.name ?? ''}
              title={metadata?.name ?? ''}
              style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF00' }}
              src={ipfsToHttp(metadata?.animation_url ?? metadata?.image)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          );
        } else {
          // Other content types, handle accordingly
          setEmbedComponent(<div>Unsupported content type</div>);
        }
      } else {
        // Error handling
        setEmbedComponent(<div>Error checking content type</div>);
      }
    };

    fetchAndRenderEmbed();
  }, [metadata]);

  return (
    <Ratio ratio={1} justifyContent="center" alignItems="stretch" spacing={0}>
      {embedComponent}
    </Ratio>
  );
}
