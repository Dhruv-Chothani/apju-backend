import Content from '../models/content.model.js';

const contentController = {
  // Add new content with optional file upload
  addContent: async (req, res) => {
    try {
      const { title, description, content, type, content_type, show_on_home, video_url } = req.body;
      
      // Support both 'type' and 'content_type' for backward compatibility
      const finalContentType = content_type || type || 'blog';
      
      // Validation
      if (!title || !description || !finalContentType) {
        return res.status(400).json({ 
          message: 'Title, description, and content type are required' 
        });
      }

      if (!['blog', 'photo', 'video'].includes(finalContentType)) {
        return res.status(400).json({ 
          message: 'Content type must be blog, photo, or video' 
        });
      }

      // Handle file upload
      let media_url = '';
      let imageBuffer = null;
      let imageType = '';

      if (req.file) {
        // Store image buffer and MIME type in MongoDB
        imageBuffer = req.file.buffer;
        imageType = req.file.mimetype;
      } else if (req.body.media_url) {
        media_url = req.body.media_url.trim();
      }

      // For video type, require video_url if no file uploaded
      if (finalContentType === 'video' && !media_url && !video_url) {
        return res.status(400).json({ 
          message: 'Video URL or video file is required for video content' 
        });
      }

      const newContent = new Content({
        title: title.trim(),
        description: description.trim(),
        content: content?.trim() || '',
        media_url,
        video_url: video_url?.trim() || '',
        content_type: finalContentType,
        show_on_home: show_on_home === 'true' || show_on_home === true,
        image: imageBuffer,
        imageType: imageType
      });

      const savedContent = await newContent.save();
      
      res.status(201).json({
        success: true,
        data: savedContent,
        message: 'Content added successfully'
      });
    } catch (error) {
      console.error('Error adding content:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to add content' 
      });
    }
  },

  // Get content by type
  getContentByType: async (req, res) => {
    try {
      const { type } = req.params;
      
      if (!['blog', 'photo', 'video'].includes(type)) {
        return res.status(400).json({ 
          message: 'Content type must be blog, photo, or video' 
        });
      }

      const content = await Content.find({ content_type: type })
        .sort({ created_at: -1 })
        .lean();

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error(`Error fetching content by type ${req.params.type}:`, error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  },

  // Get all content
  getAllContent: async (req, res) => {
    try {
      const { type, content_type } = req.query;
      let query = {};
      
      // Support both 'type' and 'content_type' query parameters
      const finalType = content_type || type;
      if (finalType && ['blog', 'photo', 'video'].includes(finalType)) {
        query.content_type = finalType;
      }

      const content = await Content.find(query)
        .sort({ created_at: -1 })
        .lean();

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching all content:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  },

  // Get homepage content (max 3 items)
  getHomeContent: async (req, res) => {
    try {
      console.log('🔍 Fetching home content...');
      
      const content = await Content.find({ show_on_home: true })
        .sort({ home_priority: -1, created_at: -1 })
        .limit(3)
        .lean();
      
      console.log(`✅ Found ${content.length} home content items`);
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching home content:', error);
      res.status(500).json({ message: 'Failed to fetch home content' });
    }
  },

  // Get content by ID
  getContentById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Content ID is required' });
      }

      const content = await Content.findById(id).lean();
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  },

  // Update content
  updateContent: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content, show_on_home, video_url } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Content ID is required' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (video_url !== undefined) updateData.video_url = video_url.trim();
      if (show_on_home !== undefined) updateData.show_on_home = show_on_home === 'true' || show_on_home === true;

      // Handle file upload if new file provided
      if (req.file) {
        // Store image buffer and MIME type in MongoDB
        updateData.image = req.file.buffer;
        updateData.imageType = req.file.mimetype;
        updateData.media_url = ''; // Clear external URL if local file uploaded
      } else if (req.body.media_url !== undefined) {
        updateData.media_url = req.body.media_url.trim();
        updateData.image = null; // Clear image buffer if external URL provided
        updateData.imageType = '';
      }

      const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.json({
        success: true,
        data: updatedContent,
        message: 'Content updated successfully'
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to update content' 
      });
    }
  },

  // Delete content
  deleteContent: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Content ID is required' });
      }

      const deletedContent = await Content.findByIdAndDelete(id);

      if (!deletedContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ message: 'Failed to delete content' });
    }
  },

  // Toggle homepage display
  toggleHomeDisplay: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Content ID is required' });
      }

      const content = await Content.findById(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      await content.toggleHomeDisplay();

      res.json({
        success: true,
        data: content,
        message: `Content ${content.show_on_home ? 'added to' : 'removed from'} homepage`
      });
    } catch (error) {
      console.error('Error toggling home display:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to toggle homepage display' 
      });
    }
  },

  // Get image by ID
  getImage: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Content ID is required' });
      }

      const content = await Content.findById(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      if (!content.image || !content.imageType) {
        return res.status(404).json({ message: 'Image not found' });
      }

      // Set the correct Content-Type header
      res.set('Content-Type', content.imageType);
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // Send the image buffer
      res.send(content.image);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ message: 'Failed to fetch image' });
    }
  }
};

export default contentController;
