const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const courseQuery = (req.query.course || '').trim();
    const keywordQuery = (req.query.keyword || '').trim();
    const params = [];

    let whereClause = '';
    if (courseQuery || keywordQuery) {
      const conditions = [];
      if (courseQuery) {
        conditions.push('g.course_code LIKE ?');
        params.push(`%${courseQuery}%`);
      }
      if (keywordQuery) {
        conditions.push('(g.title LIKE ? OR g.description LIKE ?)');
        params.push(`%${keywordQuery}%`, `%${keywordQuery}%`);
      }
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    const groups = await all(
      `
      SELECT
        g.id,
        g.title,
        g.course_code,
        g.description,
        g.owner_user_id,
        u.name AS owner_name,
        COUNT(m.user_id) AS member_count
      FROM groups g
      JOIN users u ON u.id = g.owner_user_id
      LEFT JOIN memberships m ON m.group_id = g.id
      ${whereClause}
      GROUP BY g.id
      ORDER BY g.created_at DESC
      `,
      params
    );

    let memberships = [];
    if (req.session.user) {
      memberships = await all('SELECT group_id FROM memberships WHERE user_id = ?', [req.session.user.id]);
    }
    const membershipSet = new Set(memberships.map((m) => m.group_id));

    res.render('groups', {
      groups,
      membershipSet,
      filters: {
        course: courseQuery,
        keyword: keywordQuery,
      },
    });
  } catch (err) {
    req.session.message = 'Could not load study groups.';
    res.render('groups', {
      groups: [],
      membershipSet: new Set(),
      filters: {
        course: '',
        keyword: '',
      },
    });
  }
});

router.get('/new', requireAuth, (req, res) => {
  res.render('new-group');
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, courseCode, description } = req.body;

    if (!title || !courseCode) {
      req.session.message = 'Group title and course code are required.';
      res.redirect('/groups/new');
      return;
    }

    await run(
      'INSERT INTO groups (title, course_code, description, owner_user_id) VALUES (?, ?, ?, ?)',
      [title.trim(), courseCode.toUpperCase().trim(), (description || '').trim(), req.session.user.id]
    );

    req.session.message = 'Study group created.';
    res.redirect('/groups');
  } catch (err) {
    req.session.message = 'Could not create study group.';
    res.redirect('/groups/new');
  }
});

router.post('/:groupId/join', requireAuth, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);

    const group = await get('SELECT id FROM groups WHERE id = ?', [groupId]);
    if (!group) {
      req.session.message = 'Group not found.';
      res.redirect('/groups');
      return;
    }

    const existingMembership = await get(
      'SELECT user_id, group_id FROM memberships WHERE user_id = ? AND group_id = ?',
      [req.session.user.id, groupId]
    );

    if (existingMembership) {
      req.session.message = 'You have already joined this group.';
      res.redirect('/groups');
      return;
    }

    await run('INSERT INTO memberships (user_id, group_id) VALUES (?, ?)', [req.session.user.id, groupId]);
    req.session.message = 'Joined group successfully.';
    res.redirect('/groups');
  } catch (err) {
    req.session.message = 'Could not join group.';
    res.redirect('/groups');
  }
});

router.post('/:groupId/leave', requireAuth, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);

    await run('DELETE FROM memberships WHERE user_id = ? AND group_id = ?', [req.session.user.id, groupId]);
    req.session.message = 'You left the group.';
    res.redirect('/groups');
  } catch (err) {
    req.session.message = 'Could not leave group.';
    res.redirect('/groups');
  }
});

module.exports = router;
